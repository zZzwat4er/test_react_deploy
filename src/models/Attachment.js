export default class Attachment {
    constructor(
        attachmentId,
        taskId,
        file
    ) {
        this.attachmentId = attachmentId;
        this.taskId = taskId;
        this.file = file;
    }

    static from(json) {
        return new Attachment(
            json.attachmentid,
            json.taskid,
            json.file,
        )
    }
}