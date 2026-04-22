package com.example.orderms.common;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

/**
 * 全局异常处理器：统一捕获所有异常，返回规范的 Result 格式，同时打印日志
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** JSR380 参数校验失败 → 400，提取所有字段错误信息 */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Result<?> handleValidation(MethodArgumentNotValidException e) {
        String msg = e.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));
        log.warn("参数校验失败: {}", msg);
        return Result.fail(msg);
    }

    /** 业务异常 → 使用异常中定义的 code */
    @ExceptionHandler(BusinessException.class)
    public Result<?> handleBusiness(BusinessException e) {
        log.warn("业务异常: {}", e.getMessage());
        return Result.error(e.getCode(), e.getMessage());
    }

    /** 权限不足 → 403（Spring Security 抛出） */
    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public Result<?> handleAccessDenied(AccessDeniedException e) {
        return Result.error(403, "权限不足，无法执行该操作");
    }

    /** 兜底：未知系统异常 → 500（调试模式：返回具体异常信息） */
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Result<?> handleGeneral(Exception e) {
        log.error("系统异常", e);
        // 返回具体错误信息便于调试定位问题
        String detail = e.getClass().getSimpleName() + ": " + e.getMessage();
        return Result.error(500, detail);
    }
}
