import React, { ChangeEvent } from "react";
export interface FechaNacimiento {
  año: string;
  mes: string;
  dia: string;
}
export interface PdfItem {
  text: string;
  content: string;
  coordenada: { x: number; y: number };
  page: any;
}
export interface ICSF {
  file: Blob | null;
  type: "Fisica" | "Moral" | null;
  rfc: string | null;
  curp?: string | null;
  name?: string | null;
  lastName?: string | null;
  secondLastName?: string | null;
  birthdate?: string | null;
  status: string | null;
  statusLastChange: string | null;
  commercialName: string | null;
  address: {
    zipCode: string | null;
    roadType: string | null;
    roadName: string | null;
    exteriorNumber: string | null;
    interiorNumber: string | null;
    divisionName: string | null;
    localityName: string | null;
    municipalityName: string | null;
    stateName: string | null;
    betweenRoad: string | null;
    andRoad: string | null;
    phoneNumber: string | null;
    email: string | null;
  };
  ocuppation: string | null;
  typeofDocument: string | null;
}

export interface CSFReaderProps {
  handleChange: (data: ICSF) => void;
  onLoadStart?: () => void;
  trigger: React.ReactElement<{
    onClick?: (event: ChangeEvent<HTMLInputElement>) => void;
  }>;

}
