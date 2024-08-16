import { Stack, Typography } from "@mui/material";
import { FC } from "react";

export const HomePage: FC = () => {
  return (
    <Stack
      padding={2}
      spacing={2}
      direction="row"
      justifyContent="center"
      alignItems="center"
    >
      <Typography variant="h4">Home Page</Typography>
    </Stack>
  );
};
