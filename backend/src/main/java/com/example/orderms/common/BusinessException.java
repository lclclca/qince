package com.example.orderms.common;

import lombok.Getter;

/**
 * 业务异常（区别于系统异常）
 * 业务校验失败时抛出，全局异常处理器会捕获并返回友好提示
 */
@Getter
public class BusinessException extends RuntimeException {
    private final int code;

    public BusinessException(String message) {
        super(message);
        this.code = 400;
    }

    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }
}
