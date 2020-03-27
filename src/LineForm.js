import React from "react";
import {
  Dialog,
  DialogTitle,
  Select,
  MenuItem,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from "@material-ui/core";
import AxelorService from "./service/axelor.rest";

const employmentContractService = new AxelorService({
  model: "com.axelor.apps.hr.db.EmploymentContract"
});

const serviceAPI = new AxelorService({
  model: "com.axelor.apps.orpea.planning.db.Service"
});

function LineForm({ handleClose, open, fromDate, date }) {
  const [services, setServices] = React.useState([]);
  const [contracts, setContracts] = React.useState([]);
  const [contract, setContract] = React.useState({
    contractId: "",
    serviceId: ""
  });

  React.useEffect(() => {
    const data = {
      // _domain: 'self.service = null',
    };
    employmentContractService
      .search({ fields: ["fullName", "companyDepartment"], data })
      .then(res => {
        if (res && res.data) {
          setContracts(res.data);
        }
      });
    serviceAPI.search({ fields: ["name"] }).then(res => {
      if (res && res.data) {
        setServices(res.data);
      }
    });
  }, []);

  const handleChange = React.useCallback(e => {
    setContract(c => {
      return {
        ...c,
        [e.target.name]: e.target.value
      };
    });
  }, []);

  const handleSave = React.useCallback(() => {
    const context = {
      ...contract
    };
    if (date) {
      context["lineDate"] = date;
    } else {
      context["lineMonth"] = fromDate;
    }
    const object = {
      action:
        "com.axelor.apps.orpea.planning.web.EmploymentContractController:generateEmployeeMonth",
      data: {
        ...context
      }
    };

    employmentContractService.action(object).then(res => {
      handleClose(true);
    });
  }, [contract, fromDate, date, handleClose]);
  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="simple-dialog-title"
      open={open}
      fullWidth={true}
    >
      <DialogTitle id="simple-dialog-title">Ajouter employé</DialogTitle>

      <DialogContent>
        <Typography style={{ fontWeight: "bold" }}>Contrat employé</Typography>
        <Select
          value={contract.contractId}
          onChange={handleChange}
          style={{ width: "100%", marginBottom: 10 }}
          name="contractId"
        >
          {contracts.map((c, i) => (
            <MenuItem key={i} value={c.id}>
              {c.fullName}
            </MenuItem>
          ))}
        </Select>
        <Typography style={{ fontWeight: "bold" }}>Service</Typography>
        <Select
          value={contract.serviceId}
          onChange={handleChange}
          style={{ width: "100%" }}
          name="serviceId"
        >
          {services.map((c, i) => (
            <MenuItem key={i} value={c.id}>
              {c.name}
            </MenuItem>
          ))}
        </Select>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Annuler
        </Button>
        <Button onClick={handleSave} color="primary">
          Ajouter
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default LineForm;
