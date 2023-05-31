import React, { useState, useEffect } from "react";
import { useProtectedPage } from "../components/protectedPage";
import {
  TextField,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { styled } from "@mui/material/styles";

  interface FormData {
    operation: "insert" | "update" | "delete";
    awardId?: string;
    awardName: string;
  }

  interface Award {
    award_id: string;
    name: string;
  }

  const InputField = styled(TextField)({
    marginBottom: "1rem",
  });

  const ManageAwards: React.FC = () => {
    useProtectedPage();
    const [formData, setFormData] = useState<FormData>({
      operation: "insert",
      awardName: "",
    });
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [awards, setAwards] = useState<Award[]>([]);

    useEffect(() => {
      fetchAwards();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const fetchAwards = async () => {
      try {
        const response = await fetch(
          "https://functions.yandexcloud.net/d4e96bpn267cvipclv1f"
        );
        const data = await response.json();
        setAwards(data.awards);
      } catch (error) {
        console.error(error);
      }
    };

    const handleDelete = async (awardId: string) => {
      if (!awardId) {
        setErrorMessage("Invalid award ID");
        return;
      }

      try {
        const response = await fetch(
          "https://functions.yandexcloud.net/d4esum4t3768sp096apb",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              operation: "delete",
              awardId,
            }),
          }
        );

        if (response.ok) {
          setSuccessMessage("Award deleted successfully");
          fetchAwards();
        } else {
          setErrorMessage("Error deleting award");
        }
      } catch (error) {
        console.error(error);
        setErrorMessage("Error deleting award");
      }
    };

    const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
      e?.preventDefault();

      if (formData.operation !== "delete") {
        try {
          const { operation, awardId, awardName } = formData;
          const url = "https://functions.yandexcloud.net/d4esum4t3768sp096apb";
          const body = { operation, awardId, awardName };

          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          const data = await response.json();
          console.log(data);
          setSuccessMessage(`Award ${formData.operation}d successfully`);
          setFormData({ ...formData, awardName: "", awardId: undefined });
          fetchAwards();
        } catch (error) {
          console.error(error);
          setErrorMessage(`Error ${formData.operation}ing award`);
        }
      }
    };

    return (
      <Box sx={{ p: 2 }}>
        <h2>Manage Awards</h2>
        {successMessage && <p>{successMessage}</p>}
        {errorMessage && <p>{errorMessage}</p>}
        <form onSubmit={(e) => handleSubmit(e)}>
          <InputField
            fullWidth
            label="Award ID (for update and delete)"
            id="awardId"
            name="awardId"
            value={formData.awardId || ""}
            onChange={handleChange}
          />
          <InputField
            fullWidth
            label="Award Name"
            id="awardName"
            name="awardName"
            value={formData.awardName}
            onChange={handleChange}
          />
          <Button variant="contained" type="submit">
            {formData.awardId ? "Update Award" : "Add Award"}
          </Button>
        </form>
        <TableContainer component={Paper} sx={{ mt: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Award ID</TableCell>
                <TableCell>Award Name</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(awards) ? (
                awards.map((award) => (
                  <TableRow key={award.award_id}>
                    <TableCell>{award.award_id}</TableCell>
                    <TableCell>{award.name}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        onClick={() => {
                          setFormData({
                            operation: "update",
                            awardId: award.award_id,
                            awardName: award.name,
                          });
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleDelete(award.award_id)}
                        sx={{ mx: 1 }}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3}>
                    Error fetching awards. Please check the response format.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };
export default ManageAwards;
