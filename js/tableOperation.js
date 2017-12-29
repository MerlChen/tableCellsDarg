/**
 * Author: Louis
 * Github: MerlChen
 * Date: 2017/12/28
 * 此文件主要用于处理表格列宽拖拽调整以及自定义右键菜单对表格执行操作
 * 封装是基本的封装,作者会对本文件内的方法进行持续优化,欢迎各JS前端大佬通过Issues进行沟通交流
 */
(function ($) {
    $rightList = null;

    function init(tId, domId) {
        //  初始化将CSS文件引入,方便对自定义右键菜单进行样式设置，无需手工引入
        $("head").append("<link>");
        css = $("head").children(":last");
        css.attr({
            rel: "stylesheet",
            type: "text/css",
            href: "css/tableCellsDrag.css"
        });
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

    //设置单个表格的表格列宽拖拽调整
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

    // 设置对应表格右键操作
    function setContextMenu(tId) {
        $("#" + tId)[0].oncontextmenu = function (event) {
            //  阻止默认右键菜单的出现
            event.preventDefault();
            //  生成新的自定义菜单
            setRightMenu(event);
        }
    }

    //  设置自定义右键菜单及样式
    function setRightMenu(e) {
        if ($rightList === null) {
            $rightList =
                "<div id='rightMenu'>" +
                "<ul>" +
                "<li>" +
                "<div>行操作</div><i></i>" +
                "<ul>" +
                "<li id='addRowBefore'>上插入行</li>" +
                "<li>下插入行</li>" +
                "<li>删除此行</li>" +
                "</ul>" +
                "</li>" +
                "<li>" +
                "<div>列操作</div><i></i>" +
                "<ul>" +
                "<li>左插入行</li>" +
                "<li>右插入行</li>" +
                "<li>删除此列</li>" +
                "</ul>" +
                "</li>" +
                "<li>" +
                "<div>合并操作</div><i></i>" +
                "<ul>" +
                "<li>向上合并</li>" +
                "<li>向下合并</li>" +
                "<li>向左合并</li>" +
                "<li>向右合并</li>" +
                "</ul>" +
                "</li>" +
                "<li>" +
                "<div>拆分操作</div><i></i>" +
                "<ul>" +
                "<li>拆分成行</li>" +
                "<li>拆分成列</li>" +
                "<li>完全拆分</li>" +
                "</ul>" +
                "</li>" +
                "</ul>" +
                "</div>";
            $("body").append($rightList);
        }
        $("#rightMenu").css({
            "left": e.x + 2,
            "top": e.y - 8
        });
        checkRightMenuInfo(e);
    }
    //  判断需要展示哪些自定义右键菜单
    function checkRightMenuInfo(e) {

    }
    //  移除自定义右键菜单
    function hideRightMenu() {
        if ($rightList !== null) {
            $("#rightMenu").remove();
            $rightList = null;
        }
    }
    //  当触发点击操作时，隐藏掉右键菜单
    $(window).click(function (e) {
        hideRightMenu();
    });
    //  根据当前鼠标右键的元素进行判断，如果是表格内，那么重置自定义菜单的位置，否则移除自定义右键菜单
    window.document.oncontextmenu = function (e) {
        if (e.target.localName === 'td' || e.target.localName === 'th') {
        } else {
            hideRightMenu();
        }
    }
    //暴露调用接口
    $.extend({
        tSet: function (a, b, c) {
            new init(a, b, c);
        }
    });
})(jQuery);