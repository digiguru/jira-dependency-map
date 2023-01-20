import { parseBlockers, parseMultipleBlockers, parseBlocker } from "./parse.mjs";
import {expect} from 'chai';
import { example } from "./unit.example.mjs";

describe("Jira Parser", () => {

  it("Can parse a simple ticket", () => {
    const data = {
      key: "WED-3774"
    };
    expect(parseBlocker(data)).to.deep.include({
      key: "WED-3774",
      blocks: [],
      "is blocked by": []
    });
  });

  it("Can parse a simple ticket with a summary", () => {
    const data = {
      key: "WED-3774",
      fields: {
        summary: "This is an example ticket"
      } 
    };
    expect(parseBlocker(data)).to.deep.include({
      key: "WED-3774",
      blocks: [],
      "is blocked by": [],
      summary: "This is an example ticket (unestimated)"
    });
  });

  it("Can parse a simple ticket with a story point value", () => {
    const data = {
      key: "WED-3774",
      fields: {
        customfield_10004: 5
      } 
    };
    expect(parseBlocker(data)).to.deep.include({
      key: "WED-3774",
      blocks: [],
      "is blocked by": [],
      summary: "WED-3774 (5)"
    });
  });

  it("Can parse a simple ticket with a story point and a summary", () => {
    const data = {
      key: "WED-3774",
      fields: {
        summary: "This is an example ticket",
        customfield_10004: 5
      } 
    };
    expect(parseBlocker(data)).to.deep.include({
      key: "WED-3774",
      blocks: [],
      "is blocked by": [],
      summary: "This is an example ticket (5)"
    });
  });
  //


  it("Can parse a simple ticket with a status", () => {
    const data = {
      key: "WED-3774",
      fields: {
        status: {
          name: "Done"
        }
      }
    };
    expect(parseBlocker(data)).to.deep.include({
      key: "WED-3774",
      status: "Done",
      blocks: [],
      "is blocked by": []
    });
  });

  it("Can parse a simple ticket with an epic", () => {
    const data = {
      key: "WED-3774",
      fields: {parent: {fields: {summary: "WED-7305"}}}
    };
    expect(parseBlocker(data)).to.deep.include({
      key: "WED-3774",
      grouping: "WED-7305",
      blocks: [],
      "is blocked by": []
    });
  });

  it("Can parse a simple ticket in a list", () => {
    const data = {
      issues: [
        {
          key: "WED-3774"
        }
      ]
    };

    expect(parseBlockers(data, "WED-3774")).to.deep.include({
      key: "WED-3774",
      blocks: [],
      "is blocked by": []
    });
  });

  it("Can parse out the linked ticket info", () => {
    expect(parseBlockers(example, "WED-5317")).to.deep.include({
      key: "WED-5317",
      blocks: ["WED-7039"],
      "is blocked by": ["WED-6962", "WED-6960"],
      grouping: "WED-7305"
    });
    expect(parseBlockers(example, "WED-7039")).to.deep.include({
      key: "WED-7039",
      blocks: [],
      "is blocked by": ["WED-5317", "WED-911"]
    });
    expect(parseBlockers(example, "WED-3774")).to.deep.include({
      key: "WED-3774",
      blocks: [],
      "is blocked by": []
    });
  });

  it("Parses multiple objects", () => {
    const output = parseMultipleBlockers(example);
    expect(output[0]).to.deep.include(
      {
        key: "WED-5317",
        blocks: ["WED-7039"],
        "is blocked by": ["WED-6962", "WED-6960"]
      })
    expect(output[1]).to.deep.include(
      {
        blocks: [],
        "is blocked by": ["WED-5317", "WED-911"],
        key: "WED-7039"
      }
    )
    expect(output[2]).to.deep.include({
        blocks: [],
        "is blocked by": [],
        key: "WED-3774"
      }
    )
  });
});