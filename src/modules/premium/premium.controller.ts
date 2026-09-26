import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { premiumServices } from "./premium.service";
import { sendResponse } from "../../utils/sendResposne";

const getPremiumContent = catchAsync(
    async (req : Request, res : Response, next : NextFunction)=> {
        const query = req.query;
        const result = await premiumServices.getPremiumContent(query)
        
        sendResponse(res, {
            success:true,
            statusCode : httpStatus.OK,
            message : "Premium Content Retrived Successfully",
            data : result.data,
            meta : result.meta
        })
    }
)


export const premiumController = {
    getPremiumContent
}