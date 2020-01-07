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

function overrideCacheControl(req, res, next) {
  const setHeader = res.setHeader;
  res.setHeader = function(key, value) {
    if (value === "max-age=600") {
      setHeader.call(this, key, "no-store, no-cache, must-revalidate, private");
    } else {
      setHeader.apply(this, arguments);
    }
  };
  next();
}

const app = express();
app.set("trust proxy", true);

app
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
    overrideCacheControl,
    session({
      path: adminPath + "/",
      sameSite: false,
      name: "survadm",
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
