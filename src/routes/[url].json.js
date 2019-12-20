import { Survey, SurveyResponse } from "../db";
import md from "../md";

export async function get(req, res) {
  const { url } = req.params;
  const survey = await Survey.query()
    .columns(["id", "body"])
    .notDeleted()
    .whereNotNull("published_at")
    .findOne({ url });
  if (survey) {
    survey.body = await md(survey.body);
    res.send(survey);
  } else {
    res.sendStatus(404);
  }
}

const idPattern = /^[0-9]+$/;

export async function post(req, res) {
  const { url } = req.params;
  if (idPattern.test(url)) {
    let body = "";
    req.on("data", data => {
      body += data;
      if (body.length > 1e6) {
        req.connection.destroy();
      }
    });
    req.on("end", () => {
      if (body.charAt(0) !== "{") {
        res.sendStatus(400);
        return;
      }
      SurveyResponse.query()
        .insert({
          survey_id: url,
          resp: body
        })
        .execute();
      res.sendStatus(200);
    });
  } else {
    res.sendStatus(404);
  }
}
