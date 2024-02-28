import { FechaNacimiento, ICSF, PdfItem } from "./types";
import { pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

//Funcion para obtener fecha de nacimiento persona moral
function convertirFecha(fechaString: string): string | null {
  if (fechaString === "") {
    return null; 
  }
  
  const meses: Record<string, string> = {
    'ENERO': '01',
    'FEBRERO': '02',
    'MARZO': '03',
    'ABRIL': '04',
    'MAYO': '05',
    'JUNIO': '06',
    'JULIO': '07',
    'AGOSTO': '08',
    'SEPTIEMBRE': '09',
    'OCTUBRE': '10',
    'NOVIEMBRE': '11',
    'DICIEMBRE': '12'
  };


  const partes: string[] = fechaString.split(' DE ');


  const dia: string = partes[0].trim();
  const mes: string | undefined = meses[partes[1].trim()];
  const anio: string = partes[2].trim();


  if (!mes) {
    throw new Error(`Mes no válido: ${partes[1]}`);
  }


  const fechaISO: string = `${anio}-${mes}-${dia}`;

  return fechaISO;
}


// Función para obtener la fecha de nacimiento persona fisica
export const obtenerFechaNacimiento = (
  cadena: string
): string | "Formato de fecha no válido" | null => {
  const regex = /(\d{2})(\d{2})(\d{2})/;
  const match = cadena.match(regex);

  if (match) {
    let año = match[1];
    const mes = match[2];
    const dia = match[3];

    if (parseInt(año, 10) >= 0 && parseInt(año, 10) <= 24) {
      año = `20${año}`;
    } else {
      año = `19${año}`;
    }

    const fechaNacimiento: FechaNacimiento = {
      año,
      mes,
      dia,
    };

    return `${fechaNacimiento.año}-${fechaNacimiento.mes}-${fechaNacimiento.dia}`;
  } else {
    return null;
  }
};

// Función para extraer información del PDF
export const extractText = (file: File): Promise<ICSF> => {
  return new Promise(async (resolve, reject) => {
    let flag = false;
    const fileReader = new FileReader();

    if (file) {
      fileReader.readAsArrayBuffer(file);
    }

    fileReader.onload = async (e) => {
      const buffer = e.target?.result;

      if (buffer instanceof ArrayBuffer) {
        try {
          const pdfData = new Uint8Array(buffer);
          const pdfBlob = new Blob([pdfData], { type: "application/pdf" });
          const pdfDoc = await pdfjs.getDocument({ data: pdfData }).promise;

          const yTolerance = 2;
          let items: PdfItem[] = [];

          for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
            const page = await pdfDoc.getPage(pageNum);
            const pageText = await page.getTextContent();

            pageText.items.forEach((item) => {
                if ("str" in item) {
                  if (item.str.startsWith("Actividades Económicas")) {
                    flag = true;
                  }
  
                  if (item.str.trim() !== "") {
                    const existingItem = items.find((existing, i) => {
                      if (flag === false) {
                        return (
                          existing.coordenada.y >=
                            item.transform[5] - yTolerance &&
                          existing.coordenada.y <=
                            item.transform[5] + yTolerance &&
                          existing.page === page &&
                          existing.content === "" &&
                          i === items.length - 1
                        );
                      } else {
                        return (
                          existing.coordenada.y === item.transform[5] + 12.236 &&
                          existing.page === page &&
                          existing.content === ""
                        );
                      }
                    });
  
                    if (existingItem && !item.str.includes(":")) {
                      existingItem.content = ` ${item.str}`;
                    } else {
                      items.push({
                        text: item.str,
                        content: "",
                        coordenada: {
                          x: item.transform[4],
                          y: item.transform[5],
                        },
                        page: page,
                      });
                    }
                  }
                }
              });
          }

          const data: ICSF = {
            file: pdfBlob ? pdfBlob : null,
            type: items.find((item) => item.text === "Nombre (s):")
              ? "Fisica"
              : "Moral",
            rfc: items.find((item) => item.text === "RFC:")?.content.trim() || null,
            curp: items.find((item) => item.text === "CURP:")?.content.trim() || null,
            name:
              items.find(
                (item) =>
                  item.text === "Nombre (s):" ||
                  item.text === "Denominación/Razón Social:"
              )?.content.trim() || null,
            lastName:
              items.find((item) => item.text === "Primer Apellido:")?.content.trim() ||
              null,
            secondLastName:
              items.find((item) => item.text === "Segundo Apellido:")
                ?.content.trim() || null,
                birthdate:
                items.find((item) => item.text === "Nombre (s):")
                  ? obtenerFechaNacimiento(items.find((item) => item.text === "CURP:")?.content.trim() || "")
                  : convertirFecha(items.find((item) => item.text === "Fecha inicio de operaciones:")?.content.trim() || ""),
            status:
              items.find((item) => item.text === "Estatus en el padrón:")
                ?.content.trim() || null,
            statusLastChange:
              items.find(
                (item) => item.text === "Fecha de último cambio de estado:"
              )?.content.trim() || null,
            commercialName:
              items.find((item) => item.text === "Nombre Comercial:")
                ?.content.trim() || null,
            address: {
              zipCode:
                items.find((item) => item.text === "Código Postal:")?.content.trim() ||
                null,
              roadType:
                items.find((item) => item.text === "Tipo de Vialidad:")
                  ?.content.trim() || null,
              roadName:
                items.find((item) => item.text === "Nombre de Vialidad:")
                  ?.content.trim() || null,
              exteriorNumber:
                items.find((item) => item.text === "Número Exterior:")
                  ?.content.trim() || null,
              interiorNumber:
                items.find((item) => item.text === "Número Interior:")
                  ?.content.trim() || null,
              divisionName:
                items.find((item) => item.text === "Nombre de la Colonia:")
                  ?.content.trim() || null,
              localityName:
                items.find((item) => item.text === "Nombre de la Localidad:")
                  ?.content.trim() || null,
              municipalityName:
                items.find(
                  (item) =>
                    item.text ===
                    "Nombre del Municipio o Demarcación Territorial:"
                )?.content.trim() || null,
              stateName:
                items.find(
                  (item) => item.text === "Nombre de la Entidad Federativa:"
                )?.content.trim() || null,
              betweenRoad:
                items.find((item) => item.text === "Entre Calle:")?.content.trim() ||
                null,
              andRoad:
                items.find((item) => item.text === "Y Calle:")?.content.trim() || null,
              phoneNumber: phoneNumber( items.find((item) => item.text === "Número:")?.content.trim() || "" ),
              email:  items.find((item) => item.text === "Correo Electrónico:")?.content.trim() || null,
            },
            ocuppation:
              items.find((item) => item.text === "Actividad Económica")
                ?.content.trim() || null,
            typeofDocument:
              items.some(
                (item) => item.text === "CONSTANCIA DE SITUACIÓN FISCAL"
              ) &&
              items.some(
                (item) => item.text === "CÉDULA DE IDENTIFICACIÓN FISCAL"
              )
                ? "CSF"
                : null,
          };

          resolve(data);
        } catch (error) {
          console.error("Error al procesar el PDF:", error);
          reject("Error al procesar el PDF. Asegúrate de que es un archivo PDF válido.");
        }
      }
    };

    fileReader.onerror = () => {
      reject("Error al leer el archivo.");
    };
  });
};

 const phoneNumber = (number:string) : string | null=>{
   if(number === ""){
    return null
   }

  const cleanNumber = number.replace(/\D/g, '');
   
   if (cleanNumber.length <10) {
       return null;
   }


   const firstThreeDigits = cleanNumber.slice(0, 3); 
   const nextThreeDigits = cleanNumber.slice(3, 6);
   const remainingDigits = cleanNumber.slice(6);
   const formattedNumber = `(${firstThreeDigits}) ${nextThreeDigits}-${remainingDigits}`;
 
   return formattedNumber;


 }

