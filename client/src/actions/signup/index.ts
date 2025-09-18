import { type SignupSchema, signupSchema } from "./schema";

const signup = async (formData: SignupSchema) => {
  try {
    const validatedData = signupSchema.parse(formData);
    const { confirmPassword: _confirmPassword, ...serverData } = validatedData;
    const response = await fetch("http://localhost:3001/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(serverData),
    });
    const data = await response.json();
    if (!response.ok) {
      return { error: data.message || "error creating account" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("signup error:", error);
    return { error: "unexpected error while creating account" };
  }
};

export default signup;
