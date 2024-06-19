import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";
import { subscribeWithSelector } from "zustand/middleware";

import type { StateCreator } from "zustand";

export const createStore = <T>(state: StateCreator<T>) =>
  createWithEqualityFn<T>()(
    subscribeWithSelector<T>((...args) => state(...args)),
    shallow
  );

export function sleep(seconds: number) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}
