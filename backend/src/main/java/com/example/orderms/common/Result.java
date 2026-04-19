package com.example.orderms.common;

import lombok.Data;
import java.time.Instant;

/**
 * 统一 API 响应格式：{code, message, data, timestamp}
 * 所有接口都返回此对象，方便前端统一处理
 */
@Data
public class Result<T> {
    private int code;
    private String message;
    private T data;
    private long timestamp;

    private Result(int code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
        this.timestamp = Instant.now().toEpochMilli();
    }

    /** 成功（200） */
    public static <T> Result<T> ok(T data) {
        return new Result<>(200, "success", data);
    }

    public static <T> Result<T> ok() {
        return new Result<>(200, "success", null);
    }

    /** 业务失败（400 参数/业务错误） */
    public static <T> Result<T> fail(String message) {
        return new Result<>(400, message, null);
    }

    /** 自定义状态码 */
    public static <T> Result<T> error(int code, String message) {
        return new Result<>(code, message, null);
    }
}
