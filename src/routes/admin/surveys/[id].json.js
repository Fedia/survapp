import { Survey } from "../../../db";

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
  res.send(survey);
}

export async function del(req, res) {
  if (!req.session.user) {
    res.sendStatus(400);
    return;
  }
  const { id } = req.params;
  const { email } = req.session.user;
  const r = await Survey.query()
    .ownedBy(email)
    .deleteById(id);
  res.sendStatus(r === 1 ? 200 : 400);
}

export async function post(req, res) {
  if (!req.session.user) {
    res.sendStatus(400);
    return;
  }
  const { email } = req.session.user;
  const { id } = req.params;
  const doc = req.body;
  if (!doc) {
    res.sendStatus(400);
    return;
  }
  delete doc.id;
  if (id === "new") {
    doc.owner = email;
    try {
      const newDoc = await Survey.query().insertAndFetch(doc);
      res.send(newDoc);
    } catch (e) {
      console.log(e);
      res.sendStatus(400);
    }
  } else {
    try {
      if (doc.url) {
        const sameUrlDoc = await Survey.query()
          .columns(["id", "owner"])
          .notDeleted()
          .whereNotNull("published_at")
          .whereNot({ id })
          .findOne({ url: doc.url });
        if (sameUrlDoc) {
          res.sendStatus(403);
          return;
        }
      }
      const newDoc = await Survey.query()
        .ownedBy(email)
        .patchAndFetchById(id, doc);
      res.send(newDoc);
    } catch (e) {
      console.log(e);
      res.sendStatus(400);
    }
  }
}
