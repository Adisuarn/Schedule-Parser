import {TableBody} from "../../types/ParsedDataTypes";

export function refine(data: TableBody ) {
    Object.keys(data).forEach((k) => {
        Object.keys(data[k]).forEach((v) => {
            const val = data[k][v]

            // Dust removal
            if (val.includes("|")) {
                data[k][v] = []
            }else{
                data[k][v] = data[k][v].map((e) => (e.replace("|","")))
            }
        })

        if (k === "5") {
            data[k] = {
                "1": data[k]["1"],
                "2": data[k]["2"],
                "3": data[k]["3"],
            }
        }
    })

    return data
}
