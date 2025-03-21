// import { PlusCircle, Trash2,  } from "lucide-react";
import React, { useState } from "react";
import { Box, IconButton, Stack, Chip } from "@mui/material";
import { DataGrid, GridColDef, GridActionsCellItem, GridRowId, GridToolbar } from "@mui/x-data-grid";
import { Edit, DeleteOutlined, AddCircleOutlined } from "@mui/icons-material";
// import { Header } from "../../components/Common/Header";
import { titleStyle, colors } from "../../styles/commonStyles";
import { ConfirmationModal } from "../../components/Common/Modals/ConfirmationModal";
import { FormModal } from "../../components/Common/Modals/FormModal";
import { useCreateAccount, getAccounts } from "../../queries/accounts";
import { CreateAccountRequest } from "../../representations/accounts";

const initialCreateAccountFormData: CreateAccountRequest = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  phone: "",
  isHiringManager: false,
  isAdmin: false,
};

const AccountManagerPage = () => {
  const { data: accounts } = getAccounts();
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  // const [editFormData, setEditFormData] = useState<AccountData | undefined>(undefined);

  const [createAccountFormData, setCreateAccountFormData] =
    useState<CreateAccountRequest>(initialCreateAccountFormData);
  

  const handleCloseModal = () => {
    setOpenDeleteModal(false);
    setOpenAddModal(false);
    setOpenEditModal(false);
  };

  const handleDeleteClick = (id: GridRowId) => () => {
    // setRows(rows.filter((row) => row.id !== id));
    setOpenDeleteModal(true);
  };

  const handleEditClick = (id: GridRowId) => () => {
    const selectedData = accounts?.staff.find((account) => account.id === id);
    // setEditFormData(selectedData);
    setOpenEditModal(true);
    // return id
  };

  const handleAddClick = () => {
    setOpenAddModal(true);
    // return id
  };

  const onClickCreateAccount = (data: any) => {
    setCreateAccountFormData(initialCreateAccountFormData);
    // createAccount(data);
    setOpenAddModal(false);
  };

  const columns: GridColDef[] = [
    // { field: 'id', headerName: 'User ID', width: 150 },
    { field: "firstName", headerName: "First Name", flex: 1 },
    { field: "lastName", headerName: "Last Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    {
      field: "role",
      headerName: "Role",
      renderCell: (params) => {
        const roles = [];
        if (params.row.isAdmin) roles.push("Admin");
        if (params.row.isHiringManager) roles.push("Hiring Manager");
        return (
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            sx={{
              height: "100%",
              width: "100%",
              flexWrap: "wrap",
            }}
          >
            {roles.map((role: string, index: number) => (
              <Chip key={index} label={role} size="small" />
            ))}
          </Stack>
        );
      },
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
            icon={<Edit />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteOutlined />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: colors.white }}>
      <Stack direction="row" justifyContent="space-between">
        <Box padding="10px" sx={{ ...titleStyle, fontVariant: "h4" }}>
          Accounts
        </Box>
        <IconButton aria-label="Add an Account" onClick={handleAddClick}>
          <AddCircleOutlined />
        </IconButton>
      </Stack>
      <Box sx={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={accounts?.staff || []}
          columns={columns}
          // initialState={{ pagination: paginationModel }}
          // pageSizeOptions={[5, 10]}
          // checkboxSelection
          disableColumnFilter
          disableColumnSelector
          disableDensitySelector
          disableColumnResize
          sx={{ border: 0 }}
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
        titleText="Are you sure your want to delete this account?"
      />
      {/* <FormModal
        isOpen={openAddModal}
        handleClose={handleCloseModal}
        titleText="Add an Account"
        formData={createAccountFormData}
        setFormData={setCreateAccountFormData}
        handleSubmit={onClickCreateAccount}
      /> */}
      {/* <FormModal isOpen={openEditModal} handleClose={handleCloseModal} titleText='Edit an Account' formData={editFormData} /> */}
    </Box>
  );
};

export default AccountManagerPage;
