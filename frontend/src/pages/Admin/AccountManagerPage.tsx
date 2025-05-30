// import { PlusCircle, Trash2,  } from "lucide-react";
import { AddCircleOutlineOutlined, DeleteOutlined, Edit, Group} from "@mui/icons-material";
// import GroupIcon from "@mui/icons-material/Group";
import { Box, Chip, IconButton, Stack, Button } from "@mui/material";
import { DataGrid, GridActionsCellItem, GridColDef, GridRowId, GridToolbarQuickFilter } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import { Header } from "../../components/Common/Header";
import { ConfirmationModal } from "../../components/Common/Modals/ConfirmationModal";
import { FormModal } from "../../components/Common/Modals/FormModal";
import CustomSnackbar from "../../components/Common/SnackBar";
import { useGetAccounts, useCreateAccount, useDeleteAccount, useEditAccount } from "../../queries/accounts";
import { AccountRequest } from "../../representations/accounts";
import { colors, textButtonStyle } from "../../styles/commonStyles";

const initialAccountFormData: AccountRequest = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  phone: "",
  isHiringManager: false,
  isAdmin: false,
};

const staffDataToAccountsRequest = (staffData: any): AccountRequest => {
  return {
    email: staffData.email ?? "",
    password: staffData.password ?? "",
    firstName: staffData.firstName ?? "",
    lastName: staffData.lastName ?? "",
    phone: staffData.phone ?? "",
    isHiringManager: Boolean(staffData.isHiringManager),
    isAdmin: Boolean(staffData.isAdmin),
  };
}

const AccountManagerPage = () => {
  const { data: accounts, isLoading, isError, error: accountFetchError } = useGetAccounts();

  const [openAddModal, setOpenAddModal] = useState(false);
  const [createAccountFormData, setCreateAccountFormData] =
    useState<AccountRequest>(initialAccountFormData);
    
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editAccountId, setEditAccountId] = useState<string>("");
  const [editFormData, setEditFormData] =
    useState<AccountRequest>(initialAccountFormData);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteAccountId, setDeleteAccountId] = useState<string>("");

  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState("");
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<"success" | "info" | "error" | "warning" | undefined>("success");
  
  

  const handleCloseModal = () => {
    setOpenDeleteModal(false);
    setOpenAddModal(false);
    setOpenEditModal(false);
  };

  const handleDeleteClick = (id: GridRowId) => () => {
    setDeleteAccountId(id.toString());
    setOpenDeleteModal(true);
  };

  const handleEditClick = (id: GridRowId) => () => {
    const selectedData = accounts?.staff.find((account) => account.id === id);
    const data = staffDataToAccountsRequest(selectedData);
    delete data.password;
    delete data.email;
    setEditAccountId(id.toString());
    setEditFormData(data);
    setOpenEditModal(true);
  };

  const handleAddClick = () => {
    setOpenAddModal(true);
    // return id
  };

  const headerIcon = <Group sx={{fontSize: 32, color: colors.black1}}/>
  const headerActions = (
    <Button
      startIcon={<AddCircleOutlineOutlined sx={{fontSize: 32}} />}
      sx={{ ...textButtonStyle, color: colors.blue1 }}
      onClick={handleAddClick}
    >
      Add an Account
    </Button>
  );

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
      minWidth: 100,
      align: "right",
      cellClassName: "actions",
      getActions: (temp) => {
        const id = temp.id
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

  useEffect(() => {
    if (isError) {
      setSnackbarOpen(true);
      setSnackbarMessage(accountFetchError?.message ?? "Failed to fetch accounts");
      setSnackbarSeverity("error");
    }
  }, [isError]);

  const QuickSearchToolbar = () => {
        return (
          <Box
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <GridToolbarQuickFilter
              placeholder="Search entries..."
              variant="outlined"
              size="medium"
              sx={{
                width: "100%",
                maxWidth: "50",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            />
            </Box>
        )
      }
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: colors.white }}>
      <Header icon={headerIcon} title="Users Management" actions={headerActions} />
      <Box sx={{ display: "flex", flexDirection: 'column', width: "100%", padding: "0 16px", maxHeight: 600 }}>
        <DataGrid
          rows={accounts?.staff || []}
          columns={columns}
          // initialState={{ pagination: paginationModel }}
          // pageSizeOptions={[5, 10]}
          // checkboxSelection
          loading={isLoading}
          disableColumnFilter
          disableColumnSelector
          disableDensitySelector
          disableColumnResize
          sx={{ border: 0 }}
          slots={{ toolbar: QuickSearchToolbar }}
        />
      </Box>
      <ConfirmationModal
        isOpen={openDeleteModal}
        handleClose={handleCloseModal}
        titleText="Are you sure your want to delete this account?" 
        mutationHook={useDeleteAccount(deleteAccountId)}
        />
      <FormModal
        dataState={createAccountFormData}
        initialDataState={initialAccountFormData}
        setDataState={setCreateAccountFormData}
        isOpen={openAddModal}
        handleClose={handleCloseModal}
        titleText="Add an Account"
        mutationHook={useCreateAccount}
      />
      <FormModal
        dataState={editFormData}
        initialDataState={initialAccountFormData}
        setDataState={setEditFormData}
        isOpen={openEditModal}
        handleClose={handleCloseModal}
        titleText="Edit an Account"
        mutationHook={useEditAccount(editAccountId)}
      />
      <CustomSnackbar open={snackbarOpen} message={snackbarMessage} severity={snackbarSeverity} onClose={() => setSnackbarOpen(false)} />
    </Box>
  );
};

export default AccountManagerPage;
