import { Survey } from "../../../db";
import { format } from "fast-csv";

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
  if (!req.session.user) {
    res.sendStatus(400);
    return;
  }
  const { id } = req.params;
  const { email } = req.session.user;
  const survey = await Survey.query()
    .canRead(email)
    .findById(id);
  if (survey) {
    res.writeHead(200, { "Content-Type": "text/csv" });
    const stream = survey.streamResponses();
    stream.pipe(format(csvOptions)).pipe(res);
  } else {
    res.sendStatus(400);
  }
}
