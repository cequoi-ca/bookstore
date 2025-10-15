import { Context, Next } from 'koa';

export const errorMiddleware = async (ctx: Context, next: Next) => {
  try {
    await next();
  } catch (err: any) {
    ctx.status = err.status || 500;
    ctx.body = {
      error: {
        message: err.message || 'Internal Server Error',
        status: ctx.status,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      }
    };

    // Log error
    console.error(`Error ${ctx.status}: ${err.message}`);
    if (process.env.NODE_ENV === 'development') {
      console.error(err.stack);
    }
  }
};