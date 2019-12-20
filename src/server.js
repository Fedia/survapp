import "dotenv/config";
import sirv from "sirv";
import express from "express";
import session from "cookie-session";
import compression from "compression";
import * as sapper from "@sapper/server";
import { knex, createSchema } from "./db";

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === "development";

const sessionLifetime = 12 * 60 * 60 * 1000; // 12 hours
const adminPath = process.env.ADMIN_PATH;
const indexPath = process.env.INDEX_PATH;

express()
  .use((req, res, next) => {
    if (req.path === "/" && indexPath) {
      req.url = req.originalUrl = indexPath;
    }
    next();
  })
  .use(
    compression({ threshold: 0 }),
    sirv("static", { dev }),
    (req, res, next) => {
      if (req.path === adminPath) {
        res.redirect(301, req.path + "/");
      } else {
        next();
      }
    }
  )
  .use(
    adminPath,
    session({
      path: adminPath + "/",
      sameSite: true,
      name: "session",
      keys: [process.env.AUTH_SECRET],
      maxAge: sessionLifetime
    }),
    express.json()
  )
  .use(
    sapper.middleware({
      session: req => (req.session ? req.session.user : null)
    })
  )
  .listen(PORT, err => {
    if (err) throw new Error(err);
  });

createSchema();

if (dev) {
  knex.on("query", q => console.log(q.sql, q.bindings));
}
