/**
 * Author: Louis
 * Github: MerlChen
 * Date: 2017/12/28
 * 此文件主要用于处理表格列宽拖拽调整以及自定义右键菜单对表格执行操作
 * 封装是基本的封装,作者会对本文件内的方法进行持续优化,欢迎各JS前端大佬通过Issues进行沟通交流
 */
(function ($) {
    function init(tId, domId, all) {
        //  指定ID或者ID组，进行表格列宽拖拽调整
        if (tId !== null) {
            //检测传递过来的tId是单个还是多个,多个需要以数组的形式进行传递
            if (typeof tId === 'object' && !isNaN(tId.length)) {
                tId.each(function (index, item) {
                    setTableCellsDrag(item);
                });
                //对单个表格执行列宽拖拽调整
            } else {
                setTableCellsDrag(tId);
            }
            //  指定DOM元素，对该元素下的所有表格进行列宽拖拽调整
        } else if (tId === null && domId && domId !== null) {
            var tableList = $("#" + domId).find("table");
            tableList.each(function (index, item) {
                setTableCellsDrag(item.id);
            });
        }

    }

    //设置单个ID下的
    function setTableCellsDrag(tId) {
        var tCell;
        var table = document.getElementById(tId);
        var tableWidth = document.getElementById(tId).offsetWidth;
        for (i = 0; i < table.rows.length; i++) {
            for (j = 0; j < table.rows[i].cells.length; j++) {
                //如果表格的某一列是用百分比定义的宽度，需要将百分比转化为像素的形式，否则无法拖拽变更表格的宽度
                if ((table.rows[i].cells[j].width).indexOf("%") > -1) {
                    table.rows[i].cells[j].width = (table.rows[i].cells[j].width.replace("%", "") / 100 * tableWidth).toFixed(0);
                }
                $(table.rows[i].cells[j]).mousedown(function (e) {
                    if (!e) {
                        e = window.event;
                    }
                    tCell = this;
                    if (e.originalEvent.offsetX > tCell.offsetWidth - 10) {
                        tCell.mouseDown = true;
                        tCell.oldX = e.originalEvent.x;
                        tCell.oldWidth = tCell.offsetWidth;
                    }
                });
                $(table.rows[i].cells[j]).mouseup(function () {
                    if (tCell == undefined) {
                        tCell = this;
                    }
                    tCell.mouseDown = false;
                    tCell.style.cursor = 'default';
                });
                $(table.rows[i].cells[j]).mousemove(function (e) {
                    if (!e) {
                        e = window.event;
                    }
                    if (e.originalEvent.offsetX > this.offsetWidth - 10) {
                        this.style.cursor = 'col-resize';
                    } else {
                        this.style.cursor = 'default';
                    }
                    if (tCell == undefined) {
                        tCell = this;
                    }
                    if (tCell.mouseDown !== null && tCell.mouseDown === true) {
                        tCell.style.cursor = 'default';
                        if (tCell.oldWidth + (e.originalEvent.x - tCell.oldX) > 0) {
                            tCell.width = tCell.oldWidth + (e.originalEvent.x - tCell.oldX);
                        }
                        tCell.style.cursor = 'col-resize';
                        table = tCell;
                        while (table.tagName !== 'TABLE') {
                            table = table.parentElement;
                        }
                        for (c = 0; c < table.rows.length; c++) {
                            table.rows[c].cells[tCell.cellIndex].width = tCell.width;
                        }
                    }
                });
            }
        }
    };
    //暴露调用接口
    $.extend({
        tSet: function (a, b, c) {
            new init(a, b, c);
        }
    });
})(jQuery);