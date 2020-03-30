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
import moment from "moment";
import AxelorService from "./service/axelor.rest";

const employmentContractService = new AxelorService({
  model: "com.axelor.apps.hr.db.EmploymentContract"
});
const serviceAPI = new AxelorService({
  model: "com.axelor.apps.orpea.planning.db.Service"
});

const profileService = new AxelorService({
  model: "com.axelor.apps.orpea.planning.db.Profile"
});

function LineForm({ handleClose, open, fromDate, date }) {
  const [profile, setProfile] = React.useState("");
  const [profiles, setProfiles] = React.useState([]);
  const [services, setServices] = React.useState([]);
  const [contracts, setContracts] = React.useState([]);
  const [contract, setContract] = React.useState({
    employmentContractId: "",
    serviceId: ""
  });

  React.useEffect(() => {
    profileService.search({ fields: ["name"] }).then(res => {
      if (!(res && res.data && res.data.length)) return;
      setProfiles(res.data);
      setProfile(res.data[0].id);
    });

    serviceAPI.search({ fields: ["name"] }).then(res => {
      if (res && res.data) {
        setServices(res.data);
      }
    });
  }, []);

  React.useEffect(() => {
    if (!profile) return;
    const data = {
      _domain: `self.service = null and self.profile = ${profile}`
    };
    employmentContractService
      .search({ fields: ["fullName", "companyDepartment"], data })
      .then(res => {
        if (res && res.data) {
          setContracts(res.data);
        } else {
          setContracts([]);
        }
      });
  }, [profile]);

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
      context["lineDate"] = moment(date, "DD-MM-YYYY").format("YYYY-MM-DD");
    } else {
      context["lineMonth"] = fromDate;
    }
    const object = {
      action:
        "com.axelor.apps.orpea.planning.web.EmploymentContractController:generateEmployeeDay",
      data: {
        ...context
      }
    };
    employmentContractService.action(object).then(res => {
      console.log(res);
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
      <DialogTitle id="simple-dialog-title">Ajouter employé </DialogTitle>
      <DialogContent>
        <Typography style={{ fontWeight: "bold" }}>Qualification</Typography>
        <Select
          value={profile}
          onChange={({ target: { value } }) => setProfile(value)}
          style={{ width: "100%" }}
        >
          {profiles.map((p, i) => (
            <MenuItem key={i} value={p.id}>
              {p.name}
            </MenuItem>
          ))}
        </Select>
        <Typography style={{ fontWeight: "bold" }}>Contrat employé</Typography>
        <Select
          value={contract.employmentContractId}
          onChange={handleChange}
          style={{ width: "100%" }}
          name="employmentContractId"
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
