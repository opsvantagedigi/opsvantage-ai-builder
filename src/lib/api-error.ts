import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { logger } from "./logger";
import { Prisma } from "@prisma/client";

export type ApiHandler<T = any> = (
  req: Request,
  params?: any
) => Promise<NextResponse<T>>;

export function withErrorHandling(handler: ApiHandler): ApiHandler {
  return async (req: Request, params?: any) => {
    try {
      return await handler(req, params);
    } catch (error: any) {
      const url = req.url;
      const method = req.method;

      logger.error({
        msg: "API Error occurred",
        url,
        method,
        error: error.message,
        stack: error.stack,
      });

      // Handle Zod Validation Errors
      if (error instanceof ZodError) {
        return NextResponse.json(
          { error: "Validation Error", details: error.errors },
          { status: 400 }
        );
      }

      // Handle Prisma/Database Errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // P2002: Unique constraint violation
        if (error.code === 'P2002') {
           return NextResponse.json(
            { error: "Conflict: Resource already exists" },
            { status: 409 }
          );
        }
        // Connection errors are often handled by the client retry logic, but generic DB error here
        return NextResponse.json(
            { error: "Database Error", code: error.code },
            { status: 500 }
        );
      }
      
      if (error instanceof Prisma.PrismaClientInitializationError) {
          return NextResponse.json(
              { error: "Database Connection Error" },
              { status: 503 }
          );
      }

      // Handle Google Generative AI Errors (basic check)
      if (error.message?.includes("GoogleGenerativeAI")) {
          return NextResponse.json(
              { error: "AI Service Error", details: error.message },
              { status: 503 }
          );
      }

      // Default Server Error
      return NextResponse.json(
        { error: "Internal Server Error", message: error.message },
        { status: 500 }
      );
    }
  };
}
