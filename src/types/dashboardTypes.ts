
import { ReactNode } from "react";

export interface WidgetPartial {
  id: string;
  title: string;
  type: string;
  component: ReactNode;
  icon?: ReactNode;
}

export interface TabContent {
  title: string;
  icon: ReactNode;
  content: ReactNode;
}
