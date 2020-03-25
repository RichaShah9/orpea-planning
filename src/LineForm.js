import React from 'react';
import {Dialog, DialogTitle, Select, MenuItem, DialogContent, DialogActions, Button } from '@material-ui/core';
import AxelorService from "./service/axelor.rest";

const employmentContractService = new AxelorService({
    model: "com.axelor.apps.hr.db.EmploymentContract"
});

function LineForm({handleClose, open, fromDate, date}) {
    const [contracts, setContracts] = React.useState([]);
    const [contract, setContract] = React.useState('');

    React.useEffect(() => {
        employmentContractService.search({fields: ['employee', 'companyDepartment']}).then(res => {
            console.log(res);
            if(res && res.data) {
                setContracts(res.data);
            }
        });
    }, []);

    const handleChange = React.useCallback((e) => {
        console.log(e);
        setContract(e.target.value);
    }, []);

    const handleSave = React.useCallback(() => {
        const context = {
            employmentContractId: contract,
        }
        if(date) {
            context['lineDate'] = date;
        } else {
            context['fromDate'] = fromDate;

        }
        const object = {
            action: 'com.axelor.apps.orpea.planning.web.EmploymentContractController:generateEmployeeDay',
            data: {
                ...context
            }
        }
        employmentContractService.action(object).then(res => {
            console.log(res)
            handleClose(true);
        });
    },[contract, fromDate, date, handleClose]);

    return (
        <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
            <DialogTitle id="simple-dialog-title">Add Employee</DialogTitle>
            <DialogContent>
                <Select 
                    value={contract}
                    onChange={handleChange}
                    style={{ width: '100%'}}
                >
                    {
                        contracts.map((c, i) => (
                            <MenuItem key={i} value={c.id}>{c.employee && c.employee.name}</MenuItem>
                        ))
                    }
                </Select>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleSave} color="primary">
                    Add
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default LineForm;