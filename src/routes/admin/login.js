import LRU from "lru-cache";
import nanoid from "nanoid";
import mailer from "nodemailer";
import { loginEmail } from "./_emails";

const PROD_ENV = process.env.NODE_ENV !== "development";

const tokenCache = new LRU({
  max: 500,
  maxAge: 1000 * 60 * 10
});

const emails = process.env.USER_EMAILS;
const domains = process.env.USER_DOMAINS;
const allowEmails = [];
const allowDomains = [];
const split = str => str.split(/ +/).filter(Boolean);
if (emails) {
  allowEmails.push(...split(emails));
}
if (domains) {
  allowDomains.push(...split(domains));
}

function allowedEmail(email) {
  if (allowEmails.includes(email)) return true;
  const parts = email.split("@");
  if (allowDomains.includes(parts[1])) return true;
  if (!allowDomains.length && !allowEmails.length) return true;
  return false;
}

const baseurl = req =>
  `${PROD_ENV || req.connection.encrypted ? "https" : "http"}://${
    req.headers.host
  }`;

const randString = l => "s" + nanoid(l - 1);

function sendLink({ email, link, useragent, ip }) {
  if (!process.env.MAIL_CONN) throw new Error("MAIL_CONN is empty");
  const transport = mailer.createTransport(process.env.MAIL_CONN);
  return transport.sendMail(
    loginEmail({
      email,
      link,
      username: email.split("@")[0],
      application: process.env.APP_NAME || "surv.app",
      useragent,
      ip
    })
  );
}

export async function post(req, res) {
  const { email } = req.body;
  if (email) {
    if (!allowedEmail(String(email).toLowerCase())) {
      res.sendStatus(400);
      return;
    }
    const token = randString(8);
    req.session.login = { token, email };
    tokenCache.set(token, false);

    const link = `${baseurl(req)}${req.path}?token=${token}`;
    const useragent = req.headers["user-agent"];
    const ip = req.ip;
    try {
      await sendLink({ email, link, useragent, ip });
      res.send({ status: "ok" });
    } catch (e) {
      console.error(e);
      res.status(500).send({ status: "error" });
    }
  } else {
    res.sendStatus(400);
  }
}

export async function get(req, res) {
  const { login } = req.session;
  const { token } = req.query;
  if (token && tokenCache.has(token)) {
    tokenCache.set(token, true);
  }
  if (login && tokenCache.get(login.token) === true) {
    tokenCache.del(login.token);
    req.session.login = null;
    req.session.user = { email: login.email };
  }
  if (token) {
    res.redirect(`${req.path}/../?login`);
  } else {
    res.sendStatus(req.session.user ? 200 : 400);
  }
}
