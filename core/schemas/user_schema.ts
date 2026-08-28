import {z} from "zod"

export const userSchema = z.object({
    name: z.string(),
    email: z.string().email("debe de tener un correo valido"),
    password: z.string,
})

export type user = z.infer<typeof userSchema>;