// import { PlusCircle, Trash2,  } from "lucide-react";
import * as React from 'react'
import { Box, IconButton, Stack, } from "@mui/material";
import { DataGrid, GridColDef, GridActionsCellItem, GridRowId, GridToolbar } from "@mui/x-data-grid";
import { Edit, DeleteOutlined, AddCircleOutlined } from "@mui/icons-material"
// import { Header } from "../../components/Common/Header";
import { titleStyle, colors } from "../../styles/commonStyles";
import { ConfirmationModal } from '../../components/Common/Modals/ConfirmationModal';
import { FormModal } from '../../components/Common/Modals/FormModal';

interface AccountData {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string[];
}
const dummyAccounts = [
    {
        id: 1,
        email: "abd.khan@aws.com",
        first_name: "Abd",
        last_name: "Khan",
        role: ["Admin"],
    },
    {
        id: 2,
        email: "toyotomi.hideyoshi@aws.com",
        first_name: "Toyotomi",
        last_name: "Hideyoshi",
        role: ["Hiring Manager"],
    },
    {
        id: 3,
        email: "li.lee@aws.com",
        first_name: "Li",
        last_name: "Lee",
        role: ["Hiring Manager", "Admin"],
    },
    {
        id: 4,
        email: "asa.dyptek@aws.com",
        first_name: "Asa",
        last_name: "Dyptek",
        role: ["Hiring Manager"],
    },
    {
        id: 5,
        email: "yoshiaki.ashikaga@aws.com",
        first_name: "Yoshiaki",
        last_name: "Ashikaga",
        role: ["Hiring Manager", "Admin"],
    }
]

const AccountManagerPage = () => {
    const [rows, setRows] = React.useState(dummyAccounts);
    const [openDeleteModal, setOpenDeleteModal] = React.useState(false);
    const [openAddModal, setOpenAddModal] = React.useState(false);
    const [openEditModal, setOpenEditModal] = React.useState(false);
    const [editFormData, setEditFormData] = React.useState<AccountData | undefined>(undefined);

    const addFormData = {
        id: 2,
        email: "",
        first_name: "",
        last_name: "",
        role: ["Hiring Manager", "Admin"],
    }

    const handleCloseModal = () => {
        setOpenDeleteModal(false)
        setOpenAddModal(false)
        setOpenEditModal(false)
    }

    const handleDeleteClick = (id: GridRowId) => () => {
        // setRows(rows.filter((row) => row.id !== id)); 
        setOpenDeleteModal(true)
    };

    const handleEditClick = (id: GridRowId) => () => {
        const selectedData = dummyAccounts.find(account => account.id === id);
        setEditFormData(selectedData);
        setOpenEditModal(true);
        // return id
    };

    const handleAddClick = () => {
        setOpenAddModal(true);
        // return id
    };

    const columns: GridColDef[] = [
        // { field: 'id', headerName: 'User ID', width: 150 },
        { field: 'first_name', headerName: 'First Name', flex: 1 },
        { field: 'last_name', headerName: 'Last Name', flex: 1 },
        { field: 'email', headerName: 'Email', flex: 1 },
        {
            field: 'role', 
            headerName: 'Role', 
            valueGetter: (value: string[]) => {
                if (value.length == 1) {
                    return value[0]
                }
                else {
                    return value[0] + ", " + value[1]
                }

            },
            flex: 1
        },
        {   
            field: 'actions',
            type: 'actions',
            // headerName: 'Actions',
            flex: 1,
            align: 'right',
            cellClassName: 'actions',
            getActions: ({ id }) => {
            //   const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
      
            //   if (isInEditMode) {
            //     return [
            //       <GridActionsCellItem
            //         icon={<SaveIcon />}
            //         label="Save"
            //         sx={{
            //           color: 'primary.main',
            //         }}
            //         onClick={handleSaveClick(id)}
            //       />,
            //       <GridActionsCellItem
            //         icon={<CancelIcon />}
            //         label="Cancel"
            //         className="textPrimary"
            //         onClick={handleCancelClick(id)}
            //         color="inherit"
            //       />,
            //     ];
            //   }
      
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
            }
        }
    ];

    // const headerActions = (
    //     <Container maxWidth={false}>
    //         <Button
    //         startIcon={<AddCircleOutlined />}
    //         // sx={{ ...textButtonStyle, color: colors.blue1 }}
    //     >
    //     </Button>
    //     </Container>
    // );

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: colors.white }}>
            {/* <Header title="" actions={headerActions} /> */}
            <Stack direction='row' justifyContent='space-between'>
                <Box padding='10px' sx={{...titleStyle, fontVariant:'h4' }}>Accounts</Box>
                <IconButton aria-label='Add an Account' onClick={handleAddClick}>
                    <AddCircleOutlined/>
                </IconButton>
            </Stack>
            <Box sx={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={dummyAccounts}
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
            <ConfirmationModal isOpen={openDeleteModal} handleClose={handleCloseModal} titleText='Are you sure your want to delete this account?' />
            <FormModal isOpen={openAddModal} handleClose={handleCloseModal} titleText='Add an Account' formData={addFormData} />
            <FormModal isOpen={openEditModal} handleClose={handleCloseModal} titleText='Edit an Account' formData={editFormData} />
        </Box>
    )
}

export default AccountManagerPage;