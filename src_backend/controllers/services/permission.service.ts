import { inject, injectable } from "inversify";
import { Permission } from "../../entities/permission";
import { IPermissionRepository } from "../../repositories/permission.repository";
import { TYPES } from "../../types";

export interface IPermissionService {
    getAllPermissions(): Promise<{ permissions: Permission[], pages: string[] }>
}


@injectable()
export class PermissionService implements IPermissionService {
    @inject(TYPES.IPermissionRepository) private readonly _permissionRepo: IPermissionRepository

    public async getAllPermissions(): Promise<{ permissions: Permission[], pages: string[] }> {
        const listPermissions = await this._permissionRepo.getAll();
        let permissions: Permission[] = []
        let pages = []
        for (let permission of listPermissions) {
            if (!permission.is_disable) {
                permissions.push(permission)
            }
            if (!pages.includes(permission.page)) {
                pages.push(permission.page)
            }
        }
        return { permissions, pages }
    }
}