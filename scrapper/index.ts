import { load } from "cheerio";
import console = require("console");
import fetch from "node-fetch";
import { readFileSync } from "fs";
import { join } from "path";
import * as moment from "moment";
import { EOL } from "os";

interface Message {
  kind: "message";
  from: string;
  time: string;
  body: string;
}

interface Event {
  kind: "event";
  body: string;
}

interface Notabene {
  kind: "notabene";
  body: string;
}

interface MyDate {
  kind: "date";
  body: string;
}

type AllTypes = Message | Event | Notabene | MyDate;

interface User {
  _id: any;
  name?: string;
  avatar?: string;
}

interface GiftedMessage {
  _id: any;
  text: string;
  createdAt: Date;
  user: User;
  image?: string;
  system?: boolean;
}

interface GiftedEvent {}

const imgToEmoticones = {
  emoticone1: "😬",
  emoticone2: "😍",
  emoticone3: "😘",
  emoticone4: "👍",
  emoticone5: "❤️",
  emoticone6: "🍀",
  emoticone7: "💋",
  emoticone8: "🙏",
  emoticone9: "😓",
  emoticone10: "😕"
};

const usernameToIds = {
  Kholio: 14,
  Dash: 15,
  Mön: 2,
  "Lou£ou": 3,
  "5aled": 4,
  Mimoty: 12,
  Haya: 6,
  Alia: 7,
  Nawar: 8,
  Maisam: 9,
  Nash: 10,
  Dndonet: 11,
  Dndonnet: 13,
  "O.B": 16
};
async function main() {
  const data = extractFromHtml();

  //console.log(JSON.stringify(data, null, 2));

  console.log(JSON.stringify(mapToRNGifted(data), null, 2));
}

function getUserNames(data: AllTypes[]) {
  const names = data
    .filter(d => d.kind === "message")
    .map((d: Message) => d.from);
  const dedup = [...new Set<string>(names)];

  return dedup.reduce((acc, name, index) => {
    acc[name.trim()] = index;

    return acc;
  }, {});
}

function mapToRNGifted(data: AllTypes[]): GiftedMessage[] {
  const output: GiftedMessage[] = [];

  data.forEach((d, i) => {
    if (d.kind === "message") {
      const message = d as Message;
      const isImage = message.body.trim().includes("https://");

      output.push({
        _id: i,
        createdAt: moment(message.time).toDate(),
        user: {
          _id: usernameToIds[message.from.trim()],
          name: message.from.trim()
        },
        text: isImage ? "" : message.body,
        image: isImage ? message.body.trim() : undefined
      });
    }

    if (d.kind === "date" || d.kind === "event" || d.kind === "notabene") {
      // 2015-09-19 3:50

      output.push({
        _id: i,
        text: d.body,
        createdAt:
          i === 0 ? new Date(2015, 9, 19, 3, 50) : output[i - 1].createdAt,
        system: true
      } as any);
    }
  });

  return output;
}

function extractFromHtml(): AllTypes[] {
  const htmlSource = readFileSync(join(__dirname, "index.html"));
  const $ = load(htmlSource);
  const output: AllTypes[] = [];

  $("div.whatsapp-container")
    .children()
    .each((index, element) => {
      const children = element.children;
      const header = children.find(c => c.name === "header");
      const bodyChat = children.find(c => c.attribs["class"] === "body chat");

      if (header) {
        const h1 = header.children.find(c => c.name === "h1");
        const div = header.children.find(c => c.name === "div");

        if (h1 && div) {
          const dateBody = `${extractContent(
            h1.children[0]
          )} - ${extractContent(div.children[0])}`;

          output.push({
            kind: "date",
            body: dateBody
          });
        }
      }

      if (bodyChat) {
        const ulChildren = bodyChat.children
          .filter(c => c.name === "ul")
          .map(ul => ul.children)
          .map(ulChildren => ulChildren.filter(elem => elem.name === "li"));

        ulChildren.forEach(lis => {
          const messages = extractStories(lis);

          output.push(...messages);
        });
      } else {
        throw new Error(`Could not find body chat for index ${index}`);
      }
    });

  return output;
}

function extractContent(c: CheerioElement) {
  if (c.type === "text") {
    let text = c.data
      .split("\n")
      .map(t => t.trim())
      .join(EOL);

    if (text.startsWith(EOL)) {
      text = text.substring(text.indexOf(EOL), text.length);
    }

    if (text.endsWith(EOL)) {
      text = text.substring(0, text.lastIndexOf(EOL));
    }

    return text;
  }

  if (c.name === "img") {
    const src = c.attribs["src"];

    if (
      src.startsWith("//") &&
      src.includes("emoticone") &&
      src.endsWith(".png")
    ) {
      const index = src.lastIndexOf("/");
      const emoticoneName = src
        .substring(index + 1, src.length)
        .replace(".png", "");

      return imgToEmoticones[emoticoneName];
    }

    return `https:${c.attribs["src"]}`;
  }

  if (c.name === "figure") {
    return extractImage(c);
  }
}

function extractImage(figureElement: CheerioElement) {
  const div = figureElement.children.find(c => c.name === "div")!;
  const image = div.children.find(c => c.name === "img")!;

  return `https:${image.attribs["src"]}`;
}

function extractMessage(element: CheerioElement): Message {
  //console.log("extractMessage");
  const from = element.children.find(
    e =>
      e.attribs && e.attribs["class"] && e.attribs["class"].includes("username")
  ).children[0];

  const contentDiv = element.children.find(
    e =>
      e.attribs && e.attribs["class"] && e.attribs["class"].includes("content")
  );
  let body = "";

  if (contentDiv) {
    body = contentDiv.children.map(extractContent).join(" ");
  } else {
    const figure = element.children.find(e => e.name === "figure");

    body = extractImage(figure);
  }

  const time = element.children.find(e => e.name === "time");

  if (!time) {
    console.log(body, from);
    throw new Error("faaaaail");
  }

  return {
    kind: "message",
    from: from.data,
    time: time.attribs["datetime"],
    body: body
  };
}

function extractStories(lis: CheerioElement[]): AllTypes[] {
  return lis
    .filter(
      e =>
        isEvent(e) || isNotabene(e) || isMessageReceived(e) || isMessageSent(e)
    )
    .map(e => {
      if (isMessageReceived(e) || isMessageSent(e)) {
        return extractMessage(e);
      }

      if (isEvent(e)) {
        return extractEvent(e);
      }

      return extractNotabene(e);
    });
}

function extractEvent(e: CheerioElement): Event {
  const div = e.children.find(c => c.name === "div");

  return {
    kind: "event",
    body: extractContent(div.children[0])
  };
}

function extractNotabene(e: CheerioElement): Notabene {
  const div = e.children.find(c => c.name === "div");
  const p = div.children.find(c => c.name === "p");

  return {
    kind: "notabene",
    body: extractContent(p.children[0])
  };
}

function isMessageSent(e: CheerioElement): any {
  return (
    e.attribs &&
    e.attribs["class"] &&
    e.attribs["class"].includes("message layout-sent")
  );
}

function isMessageReceived(e: CheerioElement): any {
  return (
    e.attribs &&
    e.attribs["class"] &&
    e.attribs["class"].includes("message layout-received")
  );
}

function isNotabene(e: CheerioElement): boolean {
  return (
    e.attribs &&
    e.attribs["class"] &&
    e.attribs["class"].includes("message layout-notabene")
  );
}

function isEvent(e: CheerioElement): boolean {
  return (
    e.attribs &&
    e.attribs["class"] &&
    e.attribs["class"].includes("message layout-event")
  );
}

main();
