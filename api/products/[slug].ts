import type { VercelRequest,VercelResponse } from "@vercel/node";
import handler from "../_handler.js";
export default async function product(req:VercelRequest,res:VercelResponse) {
 if(process.env.YUZIMI_EDITORIAL_PREVIEW==="true"){
  if(req.method!=="GET")return res.status(405).json({error:"Preview catalog is read-only."});
  const slug=String(req.query.slug||"");
  if(!slug||!(/^[a-zA-Z0-9_-]+$/).test(slug))return res.status(400).json({error:"Invalid product path."});
  const key=typeof req.query.key==="string"?req.query.key:"";
  if(slug==="image"&&(!key||key.length>600||key.includes("..")))return res.status(400).json({error:"Invalid image key."});
  try {
   const url=new URL("https://yuzimi.online/api/products/"+encodeURIComponent(slug));
   if(slug==="image")url.searchParams.set("key",key);
   const response=await fetch(url,{signal:AbortSignal.timeout(9000)});
   if(!response.ok)throw new Error("Public asset unavailable.");
   const mime=response.headers.get("content-type")||"application/octet-stream";
   if(slug==="image"&&!mime.startsWith("image/"))throw new Error("Nonimage asset.");
   if(slug==="image"){
    const bytes=await response.arrayBuffer();
    if(bytes.byteLength>8*1024*1024)throw new Error("Image too large.");
    res.setHeader("Content-Type",mime);
    res.setHeader("Cache-Control","public,max-age=300");
    return res.status(200).send(Buffer.from(bytes));
   }
   if(!mime.includes("json"))throw new Error("Invalid product data.");
   return res.status(200).json(await response.json());
  }catch{return res.status(503).json({error:"Public artwork is unavailable in this preview."})}
 }
 req.query.path=["products",String(req.query.slug||"")];
 return handler(req,res);
}
