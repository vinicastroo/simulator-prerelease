import type { Metadata } from "next";
import { PlaytestClient } from "./PlaytestClient";

export const metadata: Metadata = {
  title: "Playtest Sandbox — MTG",
};

export default function PlaytestPage() {
  return <PlaytestClient enableDeckTools />;
}
