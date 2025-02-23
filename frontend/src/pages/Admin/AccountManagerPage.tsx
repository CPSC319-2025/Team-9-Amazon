// import { PlusCircle, Trash2,  } from "lucide-react";
import * as React from 'react'
import { Box, IconButton, Stack, } from "@mui/material";
import { DataGrid, GridColDef, GridActionsCellItem, GridRowId, GridToolbar } from "@mui/x-data-grid";
import { Edit, DeleteOutlined, AddCircleOutlined } from "@mui/icons-material"
// import { Header } from "../../components/Common/Header";
import { titleStyle, colors } from "../../styles/commonStyles";
import { ConfirmationModal } from '../../components/Common/Modals/ConfirmationModal';

const dummyAccounts = [
    {
        id: 1,
        email: "ieyasu.tokugawa@aws.com",
        first_name: "Ieyasu",
        last_name: "Tokugawa",
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
        email: "matsudaira.sadanobu@aws.com",
        first_name: "Matsudaira",
        last_name: "Sadanobu",
        role: ["Hiring Manager", "Admin"],
    },
    {
        id: 4,
        email: "oda.nobunaga@aws.com",
        first_name: "Oda",
        last_name: "Nobunaga",
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
    // const [openFormModal, setOpenFormModal] = React.useState(false);

    const handleCloseModal = () => {
        setOpenDeleteModal(false)
    }

    const handleDeleteClick = (id: GridRowId) => () => {
        // setRows(rows.filter((row) => row.id !== id)); 
        setOpenDeleteModal(true)
    };

    const handleEditClick = (id: GridRowId) => () => {
        // setOpenFormModal(true);
        return id
    };

    const columns: GridColDef[] = [
        // { field: 'id', headerName: 'User ID', width: 150 },
        { field: 'first_name', headerName: 'First Name', width: 150 },
        { field: 'last_name', headerName: 'Last Name', width: 150 },
        { field: 'email', headerName: 'Email', width: 250 },
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
            width: 200 
        },
        {   
            field: 'actions',
            type: 'actions',
            // headerName: 'Actions',
            width: 100,
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
                <IconButton aria-label='Add an Account'>
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
            {/* <DynamicFormModal isOpen={openFormModal}/> */}
        </Box>
    )
}

export default AccountManagerPage;