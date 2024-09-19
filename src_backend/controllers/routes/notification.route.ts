import { celebrate } from "celebrate"
import { Router } from "express"
import { myContainer } from "../../inversify.config"
import { TYPES } from "../../types"
import { updateNotifyDto, searchNotifyByConditionDto, searchNotifyDto } from "../celebrate/notification.dto"
import { INotificationService } from "../services/notification.service"

export const notificationRouter = Router()



const notificationService: INotificationService = myContainer.get<INotificationService>(TYPES.INotificationService)

notificationRouter.get('/', celebrate(searchNotifyDto), async (req, res) => {
    try {
        const token = req.headers.authorization
        const result = await notificationService.getNotifications(token, parseInt('' + req.query.page_index),
            parseInt('' + req.query.page_size))
        return res.status(200).json(result)
    } catch (error) {
        return res.status(500).json(error)
    }
})

notificationRouter.put('/:id', celebrate(updateNotifyDto), async (req, res) => {
    try {
        const id = req.params.id
        const token = req.headers.authorization
        const result = await notificationService.updateReadNotification(token, id)
        return res.status(200).json(result)
    } catch (error) {
        return res.status(500).json(error)
    }
})

notificationRouter.get('/newnotification', async (req, res) => {
    try {
        const token = req.headers.authorization
        const result = await notificationService.countNewNotification(token)
        return res.status(200).json(result)
    } catch (error) {
        return res.status(500).json(error)
    }
})

notificationRouter.get('/searchnotification', celebrate(searchNotifyByConditionDto), async (req, res) => {
    try {
        const condition = {
            type: req.query.type,
            date_from: req.query.date_from,
            date_to: req.query.date_to
        }
        const token = req.headers.authorization
        const result = await notificationService.searchNotification(token, condition, parseInt('' + req.query.page_index),
            parseInt('' + req.query.page_size))
        return res.status(200).json(result)
    } catch (error) {
        return res.status(500).json(error)
    }
})

notificationRouter.delete('/:id', celebrate(updateNotifyDto), async (req, res) => {
    try {
        const id = req.params.id
        const token = req.headers.authorization
        const result = await notificationService.deleteNotification(token, id)
        return res.status(200).json(result)
    } catch (error) {
        return res.status(500).json(error)
    }
})