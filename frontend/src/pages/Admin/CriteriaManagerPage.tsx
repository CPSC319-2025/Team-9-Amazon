import * as React from "react";
import { Box, IconButton, Container, Stack } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridRowId,
  GridToolbar,
} from "@mui/x-data-grid";
import {
  DeleteOutlined,
  AddCircleOutlined,
  ArrowForward,
} from "@mui/icons-material";
// import { Header } from "../../components/Common/Header";
import { titleStyle, colors } from "../../styles/commonStyles";
import { ConfirmationModal } from "../../components/Common/Modals/ConfirmationModal";

const dummyCriterias = [
  {
    id: 1,
    name: "frontend",
    rules: [
      {
        target_text: "Node.js",
        pointsPerYearOfExperience: 1,
        maxPoints: 6,
      },
      {
        target_text: "React",
        pointsPerYearOfExperience: 5,
        maxPoints: 10,
      },
      {
        target_text: "CSS",
        pointsPerYearOfExperience: 1,
        maxPoints: 3,
      },
      {
        target_text: "Typescript",
        pointsPerYearOfExperience: 2,
        maxPoints: 8,
      },
    ],
  },
  {
    id: 2,
    name: "devops",
    rules: [
      {
        target_text: "CI/CD",
        pointsPerYearOfExperience: 1,
        maxPoints: 2,
      },
      {
        target_text: "Docker",
        pointsPerYearOfExperience: 4,
        maxPoints: 12,
      },
      {
        target_text: "Git",
        pointsPerYearOfExperience: 2,
        maxPoints: 6,
      },
    ],
  },
  {
    id: 3,
    name: "soft_skills",
    rules: [
      {
        target_text: "Team",
        pointsPerYearOfExperience: 1,
        maxPoints: 3,
      },
      {
        target_text: "Communication",
        pointsPerYearOfExperience: 1,
        maxPoints: 2,
      },
    ],
  },
  {
    id: 4,
    name: "frontend",
    rules: [
      {
        target_text: "Node.js",
        pointsPerYearOfExperience: 1,
        maxPoints: 6,
      },
      {
        target_text: "React",
        pointsPerYearOfExperience: 5,
        maxPoints: 10,
      },
      {
        target_text: "CSS",
        pointsPerYearOfExperience: 1,
        maxPoints: 3,
      },
      {
        target_text: "Typescript",
        pointsPerYearOfExperience: 2,
        maxPoints: 8,
      },
    ],
  },
  {
    id: 5,
    name: "devops",
    rules: [
      {
        target_text: "CI/CD",
        pointsPerYearOfExperience: 1,
        maxPoints: 2,
      },
      {
        target_text: "Docker",
        pointsPerYearOfExperience: 4,
        maxPoints: 12,
      },
      {
        target_text: "Git",
        pointsPerYearOfExperience: 2,
        maxPoints: 6,
      },
    ],
  },
  {
    id: 6,
    name: "soft_skills",
    rules: [
      {
        target_text: "Team",
        pointsPerYearOfExperience: 1,
        maxPoints: 3,
      },
      {
        target_text: "Communication",
        pointsPerYearOfExperience: 1,
        maxPoints: 2,
      },
    ],
  },
];

interface CriteriaRule {
  target_text: string;
  pointsPerYearOfExperience: number;
  maxPoints: number;
}

const CriteriaManagerPage = () => {
  const [rows, setRows] = React.useState(dummyCriterias);
  const [openDeleteModal, setOpenDeleteModal] = React.useState(false);
  // const [openFormModal, setOpenFormModal] = React.useState(false);

  const handleCloseModal = () => {
    setOpenDeleteModal(false);
  };

  const handleDeleteClick = (id: GridRowId) => () => {
    // setRows(rows.filter((row) => row.id !== id));
    setOpenDeleteModal(true);
  };

  const handleCriteriaDetailsClick = (id: GridRowId) => () => {
    // setOpenFormModal(true);
    return id;
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", flex: 1 },
    {
      field: "rules",
      headerName: "Keywords",
      valueGetter: (value: CriteriaRule[]) => {
        const targetTexts = value.map(
          (element: CriteriaRule) => element.target_text
        );
        return targetTexts.join(", ");
      },
      minWidth: 200,
      flex: 1,
    },
    {
      field: "actions",
      type: "actions",
      // headerName: 'Actions',
      flex: 1,
      align: "right",
      cellClassName: "actions",
      getActions: ({ id }) => {
        return [
          <GridActionsCellItem
            icon={<DeleteOutlined />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<ArrowForward />}
            label="Criteria Details"
            //   className=""
            onClick={handleCriteriaDetailsClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: colors.white }}>
      {/* <Header title="" actions={headerActions} /> */}
      <Stack direction="row" justifyContent="space-between">
        <Box padding="10px" sx={{ ...titleStyle, fontVariant: "h4" }}>
          Criteria
        </Box>
        <IconButton aria-label="Add a Criteria">
          <AddCircleOutlined />
        </IconButton>
      </Stack>
      <Box sx={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={dummyCriterias}
          columns={columns}
          // initialState={{ pagination: paginationModel }}
          // pageSizeOptions={[5, 10]}
          // checkboxSelection
          disableColumnFilter
          disableColumnSelector
          disableDensitySelector
          disableColumnResize
          sx={{ border: 0, justifyContent: "space-between" }}
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
            },
          }}
        />
      </Box>
      <ConfirmationModal
        isOpen={openDeleteModal}
        handleClose={handleCloseModal}
        titleText="Are you sure your want to delete this criteria?"
      />
      {/* <DynamicFormModal isOpen={openFormModal}/> */}
    </Box>
  );
};

export default CriteriaManagerPage;
