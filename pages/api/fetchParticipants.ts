import { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";
import unzipper from "unzipper";

interface Contest {
  name: string;
  contest_id: string;
}

interface Participation {
  contest_id: string;
  participant_id: string;
  award_id: string;
}

interface Participant {
  participant_id: string;
  name: string;
  country_id: string;
}

interface Country {
  country_id: string;
  name: string;
}

interface Award {
  award_id: string;
  name: string;
}

interface ArchiveData {
  contests: Contest[];
  participations: Participation[];
  participants: Participant[];
  countries: Country[];
  awards: Award[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { archiveName, contestName } = req.query;

  // Fetch the participant data from ydb
  const response = await fetch(
    "https://functions.yandexcloud.net/d4e96bpn267cvipclv1f"
  );
  const data: unknown = await response.json();

  const typedData = data as ArchiveData;

  const contestPage = typedData.contests.find(
    (contest) => contest.name === contestName
  );
  const contestPageId = contestPage ? contestPage.contest_id : null;

  const filteredParticipations = typedData.participations.filter(
    (participation) => participation.contest_id === contestPageId
  );

  // Join participations with participants, countries, and awards
  const participations = await Promise.all(
    filteredParticipations.map(async (participation) => {
      const participant = typedData.participants.find(
        (participant) =>
          participant.participant_id === participation.participant_id
      );
      const country = typedData.countries.find(
        (country) => country.country_id === participant?.country_id
      );
      const award = typedData.awards.find(
        (award) => award.award_id === participation.award_id
      );

      const archiveUrl = `https://storage.yandexcloud.net/contest-bucket/${archiveName}.zip`;
      const zipResponse = await fetch(archiveUrl);
      if (!zipResponse.ok) {
        throw new Error("Failed to download the archive.");
      }
      const zipBuffer = await zipResponse.buffer();

      const extractFolderPath = await unzipper.Open.buffer(zipBuffer);
      const imageExtensions = [".png", ".jpg", ".jpeg"];
      const imageFilePath = imageExtensions
        .map((extension) => `${participant?.name}${extension}`)
        .find((path) =>
          extractFolderPath.files.some((file) => file.path === path)
        );
      const extractedImage = extractFolderPath.files.find(
        (file) => file.path === imageFilePath
      );

      let image;
      if (extractedImage) {
        const imageBuffer = await extractedImage.buffer();
        const base64Image = Buffer.from(imageBuffer).toString("base64");
        const imageUrl = `data:image/${extractedImage.type};base64,${base64Image}`;
        image = imageUrl;
      } else {
        image =
          "https://villagesonmacarthur.com/wp-content/uploads/2020/12/Blank-Avatar.png";
      }

      return {
        participant_ru: participant?.name,
        country_ru: country?.name,
        place: award ? award.name : "",
        image: image,
      };
    })
  );

  res.status(200).json({ students: participations });
}
