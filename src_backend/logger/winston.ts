import winston from 'winston'
import path from 'path'


const logger = winston.createLogger({
    // format của log được kết hợp thông qua format.combine
    format: winston.format.combine(
        winston.format.splat(),
        // Định dạng time cho log
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        // thêm màu sắc
        winston.format.colorize(),
        // thiết lập định dạng của log
        winston.format.printf(
            log => {
                // nếu log là error hiển thị stack trace còn không hiển thị message của log 
                if (log.stack) return `[${log.timestamp}] ${log.stack}`;
                return `[${log.timestamp}] ${log.message}`;
            },
        ),
    ),
    transports: [
        // Thiết lập ghi các errors vào file 
        new winston.transports.File({
            level: 'error',
            filename: path.join('./error_log/errors.log')
        })
    ],
})

//hiển thị log thông qua console
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console());
}

export default logger
