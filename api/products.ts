import type { VercelRequest,VercelResponse } from "@vercel/node";
import handler from "./_handler.js";
export default async function products(req:VercelRequest,res:VercelResponse) {
 if(process.env.YUZIMI_EDITORIAL_PREVIEW==="true"){
  if(req.method!=="GET")return res.status(405).json({error:"Preview catalog is read-only."});
  try {
   const response=await fetch("https://yuzimi.online/api/products",{headers:{"accept":"application/json"},signal:AbortSignal.timeout(8500)});
   if(!response.ok)throw new Error("Public catalog unavailable.");
   const data=await response.json();
   if(!data||!Array.isArray(data.products))throw new Error("Invalid catalog.");
   res.setHeader("Cache-Control","public,max-age=30,stale-while-revalidate=120");
   return res.status(200).json({products:data.products.filter((p:any)=>p&&typeof p.id==="string"&&typeof p.name==="string"&&p.status!=="draft")});
  } catch {return res.status(503).json({error:"The public catalog could not be loaded for this design preview."})}
 }
 req.query.path=["products"];
 return handler(req,res);
}
