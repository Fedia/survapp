import { Survey } from "../../db";

export async function get(req, res) {
  if (!req.session.user) {
    res.sendStatus(400);
    return;
  }
  const { email } = req.session.user;
  const query = Survey.query();
  if ("deleted" in req.query) {
    query
      .deletedBy(email)
      .columns(["id", "url", "title", "owner", "updated_at", "deleted_at"])
      .orderBy("deleted_at", "desc");
  } else {
    query
      .notDeleted()
      .canRead(email)
      .columns(["id", "url", "title", "owner", "updated_at", "published_at"])
      .orderBy("updated_at", "desc");
  }
  res.send(await query);
}
