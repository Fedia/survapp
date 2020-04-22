import { Survey } from "../../../db";
import { format } from "fast-csv";
import createToken from "./_token";

function transform(row) {
  try {
    const resp = JSON.parse(row.resp);
    delete row.resp;
    return { ...resp, ...row };
  } catch (e) {
    return;
  }
}

const csvOptions = { headers: true, delimiter: ";", writeBOM: true, transform };

export async function get(req, res) {
  const { id } = req.params;
  let survey;
  if (req.session.user) {
    const { email } = req.session.user;
    survey = await Survey.query().canRead(email).findById(id);
  } else if (req.query.key && req.query.key === createToken(id)) {
    survey = await Survey.query().findById(id);
  } else {
    res.sendStatus(400);
    return;
  }
  if (survey) {
    res.writeHead(200, { "Content-Type": "text/csv" });
    const stream = survey.streamResponses();
    stream.pipe(format(csvOptions)).pipe(res);
  } else {
    res.sendStatus(400);
  }
}
