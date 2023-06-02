// @ts-check
import {
  LitElement,
} from "lit";
// import { DefineableMixin } from "../define.js";
// import { ScopedElementsMixin } from "./exports/scoped-elements.js"
import { LitScopedElementsMixin } from "./exports/lit.js"

// export class BaseElement extends LitScopedElementsMixin(LitElement) {}
export class BaseElement extends LitScopedElementsMixin(LitElement) {}

const x = new BaseElement()
x.click()
