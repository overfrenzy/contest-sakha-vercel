export default async function handler(req, res) {
    const contestName = 'TUY-2021'; // Change the contest name here
  
    const response = await fetch(
      'https://functions.yandexcloud.net/d4e96bpn267cvipclv1f'
    );
    const data = await response.json();
  
    const contestPage = data.contests.find(
      (contest) => contest.name === contestName
    );
    const contestPageId = contestPage ? contestPage.contest_id : null;
  
    const filteredParticipations = data.participations.filter(
      (participation) => participation.contest_id === contestPageId
    );
  
    // Join participations with participants, countries, and awards
    const participations = filteredParticipations.map((participation) => {
      const tasksdone = JSON.parse(participation.tasksdone);
      const participant = data.participants.find(
        (participant) =>
          participant.participant_id === participation.participant_id
      );
      const country = data.countries.find(
        (country) => country.country_id === participant.country_id
      );
      const award = data.awards.find(
        (award) => award.award_id === participation.award_id
      );
  
      return {
        tasksdone,
        name: participant.name,
        country: country.name,
        awardName: award ? award.name : '',
      };
    });
  
    res.status(200).json({ filteredParticipations: participations });
  }
  