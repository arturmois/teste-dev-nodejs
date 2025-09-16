import { type SignupSchema, signupSchema } from "./schema";

const signup = async (formData: SignupSchema) => {
  const validatedData = signupSchema.parse(formData);
  const response = await fetch("http://localhost:3001/api/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(validatedData),
  });
  if (!response.ok) {
    throw new Error("Erro ao criar conta");
  }
  return response.json();
};

export { signup };
