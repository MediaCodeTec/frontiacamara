import { JSX } from "react";

export type Postura = 'parado' | 'sentado' | 'echado' | 'caido_suelo' | null;

export interface PosturaData {
  postura: Postura;
}

export interface PosturaConfig {
  color: string;
  icon: JSX.Element;
  texto: string;
  descripcion: string;
  
}