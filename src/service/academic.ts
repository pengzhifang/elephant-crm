//学术管理模块相关API
import { axiosGet, axiosPost } from "./axios";


/**
 * 视频管理-列表
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2340052
 */
export const videoListApi = (data?: any): Promise<any> => {
    return axiosGet('/bms/user-api/video/v1/page-list', data);
}

/**
 * 视频管理-删除
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2340060
 */
export const deleteVideoApi = (data?: any): Promise<any> => {
    return axiosPost('/bms/user-api/video/v1/delete', data);
}

/**
 * 视频管理-发布
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2340064
 */
export const publishVideoApi = (data?: any): Promise<any> => {
    return axiosPost('/bms/user-api/video/v1/publish', data);
}
/**
 * 视频管理-新增
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2340056
 */
export const addVideoApi = (data?: any): Promise<any> => {
    return axiosPost('/bms/user-api/video/v1/insert', data);
}

/**
 * 视频管理-视频上传转码
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2340089
 */
export const uploadVideoApi = (data?: any): Promise<any> => {
    return axiosPost('/bms/open-api/file/v1/vod-trancode', data);
}
/**
 * 视频管理-编辑
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2340074
 */
export const updateVideoApi = (data?: any): Promise<any> => {
    return axiosPost('/bms/user-api/video/v1/update', data);
}

/**
 * 视频管理-批量导入
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2340070
 */
export const importVideoApi = (data?: any): Promise<any> => {
    return axiosPost('/bms/user-api/video/v1/import', data);
}

/**
 * 视频管理-批量导入保存
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2340068
 */
export const importSaveVideoApi = (data?: any): Promise<any> => {
    return axiosGet('/bms/user-api/video/v1/import-save', data);
}
/**
 * 课时管理-列表
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2340097
 */
export const lessonListApi = (data?: any): Promise<any> => {
    return axiosPost('/bms/user-api/lesson/v1/page', data);
}

/**
 * 课时管理-新增
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2340086
 */
export const addLessonApi = (data?: any): Promise<any> => {
    return axiosPost('/bms/user-api/lesson/v1/save', data);
}

/**
 * 课时管理-编辑
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2340091
 */
export const updateLessonApi = (data?: any): Promise<any> => {
    return axiosPost('/bms/user-api/lesson/v1/update', data);
}

/**
 * 课时管理-删除
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2340093
 */
export const deleteLessonApi = (data?: any): Promise<any> => {
    return axiosPost('/bms/user-api/lesson/v1/delete', data);
}

/**
 * 课时管理-批量发布下架
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2340095
 */
export const publishLessonApi = (data?: any): Promise<any> => {
    return axiosPost('/bms/user-api/lesson/v1/batch-publish', data);
}

/**
 * 课时管理-课时详情
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2340100
 */
export const lessonInfoApi = (data?: any): Promise<any> => {
    return axiosGet('/bms/user-api/lesson/v1/info', data);
}

/**
 * 对话管理-列表
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2340054
 */
export const dialogListApi = (data?: any): Promise<any> => {
    return axiosGet('/bms/user-api/dialogue/v1/page-list', data);
}

/**
 * 对话管理-新增
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2340058
 */
export const addDialogApi = (data?: any): Promise<any> => {
    return axiosPost('/bms/user-api/dialogue/v1/insert', data);
}

/**
 * 对话管理-修改
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2340072
 */
export const updateDialogApi = (data?: any): Promise<any> => {
    return axiosPost('/bms/user-api/dialogue/v1/update', data);
}

/**
 * 对话管理-删除
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2340062
 */
export const deleteDialogApi = (data?: any): Promise<any> => {
    return axiosPost('/bms/user-api/dialogue/v1/delete', data);
}

/**
 * 对话管理-发布
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2340066
 */
export const publishDialogApi = (data?: any): Promise<any> => {
    return axiosPost('/bms/user-api/dialogue/v1/publish', data);
}

/**
 * 对话管理-详情
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2340076
 */
export const dialogInfoApi = (data?: any): Promise<any> => {
    return axiosGet('/bms/user-api/dialogue/v1/detail', data);
}

/**
 * 等级
 * @link
 */
export const getLevelApi = (data?: any): Promise<any> => {
    return axiosGet('/bms/open-api/video/v1/levels', data);
}

/**
 * 课程管理-列表
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2340689
 */
export const courseListApi = (data?: any): Promise<any> => {
    return axiosPost('/bms/user-api/course/v1/page', data);
}

/**
 * 课程管理-新增
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2340676
 */
export const addCourseApi = (data?: any): Promise<any> => {
    return axiosPost('/bms/user-api/course/v1/save', data);
}

/**
 * 课程管理-编辑
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2340678
 */
export const updateCourseApi = (data?: any): Promise<any> => {
    return axiosPost('/bms/user-api/course/v1/update', data);
}

/**
 * 课程管理-删除
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2340680
 */
export const deleteCourseApi = (data?: any): Promise<any> => {
    return axiosPost('/bms/user-api/course/v1/delete', data);
}

/**
 * 课程管理-发布下架
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2340683
 */
export const publishCourseApi = (data?: any): Promise<any> => {
    return axiosPost('/bms/user-api/course/v1/publish', data);
}

/**
 * 课程管理-课程详情
 * @link http://wiki.blingabc.com/pages/viewpage.action?pageId=2340691
 */
export const courseInfoApi = (data?: any): Promise<any> => {
    return axiosGet('/bms/user-api/course/v1/detail', data);
}

