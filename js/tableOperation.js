/**
 * Author: Louis
 * Github: MerlChen
 * Date: 2017/12/28
 * 此文件主要用于处理表格列宽拖拽调整以及自定义右键菜单对表格执行操作
 * 封装是基本的封装,作者会对本文件内的方法进行持续优化,欢迎各JS前端大佬通过Issues进行沟通交流
 */
(function ($) {
    $rightList = null;
    $domInfo = {};
    $tableCells = 0;
    $operationList = ["addRowBefore", "addRowAfter", "deleteRow", "addColLeft", "addColRight", "deleteCol", "mergeBefore", "mergeAfter", "mergeLeft", "mergeRight", "splitCol", "splitRow", "fullSplit"];

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
                    setContextMenu(item);
                    setTableCellsDrag(item);
                });
                //对单个表格执行列宽拖拽调整
            } else {
                setContextMenu(tId);
                setTableCellsDrag(tId);
            }
            //  指定DOM元素，对该元素下的所有表格进行列宽拖拽调整
        } else if (tId === null && domId && domId !== null) {
            var tableList = $("#" + domId).find("table");
            tableList.each(function (index, item) {
                setContextMenu(item.id);
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
    }

    // 设置对应表格右键操作
    function setContextMenu(tId) {
        $("#" + tId)[0].oncontextmenu = function (event) {
            //  阻止默认右键菜单的出现
            event.preventDefault();
            //  生成新的自定义菜单
            setRightMenu(event, tId);
        }
    }

    //  设置自定义右键菜单及样式
    function setRightMenu(e, tId) {
        if ($rightList === null) {
            $rightList = "<div id='rightMenu'><ul><li id='trOperation'><div>此行操作</div><i></i><ul><li id='addRowBefore'>上插入行</li><li id='addRowAfter'>下插入行</li><li id='deleteRow'>删除此行</li></ul></li><li id='colOperation'><div>此列操作</div><i></i><ul><li id='addColLeft'>左插入列</li><li id='addColRight'>右插入列</li><li id='deleteCol'>删除此列</li></ul></li><li id='mergeOperation'><div>合并操作</div><i></i><ul><li id='mergeBefore'>向上合并</li><li id='mergeAfter'>向下合并</li><li id='mergeLeft'>向左合并</li><li id='mergeRight'>向右合并</li></ul></li><li id='splitOperation'><div>拆分操作</div><i></i><ul><li id='splitRow'>拆分成行</li><li id='splitCol'>拆分成列</li><li>完全拆分</li></ul></li></ul></div>";
            $("body").append($rightList);
        }
        $("#rightMenu").css({
            "left": e.x + 2,
            "top": e.y - 8
        });
        checkRightMenuInfo(e, tId);
    }

    //  判断需要展示哪些自定义右键菜单
    function checkRightMenuInfo(e, tId) {
        if (e.target.localName === 'td' || e.target.localName === 'th') {
            $domInfo.tdDomInfo = e.target;
            $domInfo.cellIndex = $domInfo.tdDomInfo.cellIndex;
            $domInfo.trDomInfo = $($domInfo.tdDomInfo).parent();
            $domInfo.rowIndex = $domInfo.trDomInfo[0].rowIndex;
            $domInfo.rowSpan = $domInfo.tdDomInfo.rowSpan;
            $domInfo.colSpan = $domInfo.tdDomInfo.colSpan;
            $domInfo.table = $("#" + tId)[0];
            //  拆分操作是否显示
            if ($domInfo.colSpan === 1 && $domInfo.rowSpan === 1) {
                $("#splitOperation").hide();
                //  拆分操作子级菜单显示处理
            } else {
                $("#splitOperation").show();
                //  如果当前单元格的列合并值大于1，显示拆分成列
                if ($domInfo.colSpan > 1) {
                    $("#splitCol").show();
                    //  否则隐藏拆分成列
                } else {
                    $("#splitCol").hide();
                }
                //  如果当前单元格的行合并值大于1，显示拆分成行
                if ($domInfo.rowSpan > 1) {
                    $("#splitRow").show();
                    //  否则隐藏拆分成行
                } else {
                    $("#splitRow").hide();
                }
            }
            //  如果当前单元格是第一个单元格，隐藏向左合并
            if ($domInfo.cellIndex === 0) {
                $("#mergeLeft").hide();
                //  否则显示向左合并
            } else {
                $("#mergeLeft").show();
            }
            //  如果当前单元格是第一行，隐藏向上合并
            if ($domInfo.rowIndex === 0) {
                $("#mergeBefore").hide();
            } else {
                $("#mergeBefore").show();
            }
            //  如果是最后一列,隐藏向右合并
            if ($domInfo.cellIndex === $domInfo.table.rows[$domInfo.rowIndex].cells.length - 1) {
                $("#mergeRight").hide();
                //  否则显示向右合并
            } else {
                $("#mergeRight").show();
            }
            //  如果是第一行,隐藏向上合并
            if ($domInfo.rowIndex === $domInfo.table.rows.length - 1) {
                $("#mergeAfter").hide();
            } else {
                $("#mergeAfter").show();
            }
        }
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
        $operationList.forEach(function (item) {
            if (thisId === item) {
                var thisId = e.target.id ? e.target.id : "";
                for (var i = 0; i < $domInfo.table.rows[0].cells.length; i++) {
                    if ($domInfo.table.rows[0].cells[i].colSpan > 1) {
                        $tableCells = $tableCells + $domInfo.table.rows[0].cells[i].colSpan - 1;
                    } else {
                        $tableCells = $tableCells + 1;
                    }
                }
                //  上插入行
                if (thisId === 'addRowBefore') {
                    // 给当前行的上一行增加一行
                    var newRow = $domInfo.table.insertRow($domInfo.rowIndex);
                    //  给当前新增的行，插入对应的列数
                    console.log($tableCells);
                    for (var newCell = 0; newCell < $tableCells; newCell++) {
                        newRow.insertCell(newCell).style.height = '20px';
                    }
                }
                //  下插入行
                if (thisId === 'addRowAfter') {
                    // 给当前行的下一行增加一行
                    var newRow = $domInfo.table.insertRow($domInfo.rowIndex + 1);
                    //  给当前新增的行，插入对应的列数
                    for (var newCell = 0; newCell < $tableCells; newCell++) {
                        newRow.insertCell(newCell).style.height = '20px';
                    }
                }
                //  左插入列
                if (thisId === 'addColLeft') {
                    //  给当前列的左侧增加一列
                    for (var i = 0; i < $domInfo.table.rows.length; i++) {
                        $domInfo.table.rows[i].insertCell($domInfo.cellIndex).style.width = '10%';
                    }
                }
                //  右插入列
                if (thisId === 'addColRight') {
                    //  给当前列的右侧增加一列
                    for (var i = 0; i < $domInfo.table.rows.length; i++) {
                        $domInfo.table.rows[i].insertCell($domInfo.cellIndex + 1).style.width = '10%';
                    }
                }
                //  删除此行
                if (thisId === 'deleteRow') {
                    $domInfo.table.rows[$domInfo.rowIndex].remove();
                }
                //  删除此列
                if (thisId === 'deleteCol') {
                    //  遍历表格的每一行，依次删除当前列
                    for (var i = 0; i < $domInfo.table.rows.length; i++) {
                        $domInfo.table.rows[i].cells[$domInfo.cellIndex].remove();
                    }
                }
                //  向左合并
                if (thisId === 'mergeLeft') {
                    //  当前单元格与左侧单元格进行单元格合并，内容值合并
                    $domInfo.table.rows[$domInfo.rowIndex].cells[$domInfo.cellIndex].innerHTML = $domInfo.table.rows[$domInfo.rowIndex].cells[$domInfo.cellIndex].innerHTML + $domInfo.table.rows[$domInfo.rowIndex].cells[$domInfo.cellIndex - 1].innerHTML;
                    $domInfo.table.rows[$domInfo.rowIndex].cells[$domInfo.cellIndex].colSpan = $domInfo.table.rows[$domInfo.rowIndex].cells[$domInfo.cellIndex].colSpan + $domInfo.table.rows[$domInfo.rowIndex].cells[$domInfo.cellIndex - 1].colSpan;
                    $domInfo.table.rows[$domInfo.rowIndex].cells[$domInfo.cellIndex - 1].remove();
                }
                //  向右合并
                if (thisId === 'mergeRight') {
                    //  当前单元格与右侧单元格进行单元格合并，内容值合并
                    $domInfo.table.rows[$domInfo.rowIndex].cells[$domInfo.cellIndex].innerHTML = $domInfo.table.rows[$domInfo.rowIndex].cells[$domInfo.cellIndex].innerHTML + $domInfo.table.rows[$domInfo.rowIndex].cells[$domInfo.cellIndex + 1].innerHTML;
                    $domInfo.table.rows[$domInfo.rowIndex].cells[$domInfo.cellIndex].colSpan = $domInfo.table.rows[$domInfo.rowIndex].cells[$domInfo.cellIndex].colSpan + $domInfo.table.rows[$domInfo.rowIndex].cells[$domInfo.cellIndex + 1].colSpan;
                    $domInfo.table.rows[$domInfo.rowIndex].cells[$domInfo.cellIndex + 1].remove();
                }
                //  向下合并
                if (thisId === 'mergeAfter') {
                    //  将当前单元格与下方单元格进行单元格合并，内容值合并
                    $domInfo.table.rows[$domInfo.rowIndex].cells[$domInfo.cellIndex].innerHTML = $domInfo.table.rows[$domInfo.rowIndex].cells[$domInfo.cellIndex].innerHTML + $domInfo.table.rows[$domInfo.rowIndex + 1].cells[$domInfo.cellIndex].innerHTML;
                    $domInfo.table.rows[$domInfo.rowIndex].cells[$domInfo.cellIndex].rowSpan = $domInfo.table.rows[$domInfo.rowIndex].cells[$domInfo.cellIndex].rowSpan + $domInfo.table.rows[$domInfo.rowIndex + 1].cells[$domInfo.cellIndex].rowSpan;
                    $domInfo.table.rows[$domInfo.rowIndex + 1].cells[$domInfo.cellIndex].remove();
                }
                //  拆分成列
                if (thisId === 'splitCol') {
                    //  将当前单元格拆分成若干小单元格
                    for (var i = 1; i < $domInfo.table.rows[$domInfo.rowIndex].cells[$domInfo.cellIndex].colSpan; i++) {
                        $($domInfo.table.rows[$domInfo.rowIndex].cells[$domInfo.cellIndex]).after($domInfo.table.rows[$domInfo.rowIndex].insertCell($domInfo.cellIndex));
                    }
                    $domInfo.table.rows[$domInfo.rowIndex].cells[$domInfo.cellIndex].colSpan = 1;
                }
                //  拆分成行
                if (this.id === 'splitRow') {

                }
                $tableCells = 0;
                setTableCellsDrag($domInfo.table.id);
            }
        });
        hideRightMenu();
    });
    //  子级菜单点击事件
    $("#rightMenu li").click(function (e) {
        e.stopPropagation();//  阻止事件冒泡
        console.log(e);
    });
    //  根据当前鼠标右键的元素进行判断，如果是表格内，那么重置自定义菜单的位置，否则移除自定义右键菜单
    window.document.oncontextmenu = function (e) {
        if (e.target.localName === 'td' || e.target.localName === 'th') {
        } else {
            hideRightMenu();
        }
    };
    //暴露调用接口
    $.extend({
        tSet: function (a, b, c) {
            new init(a, b, c);
        }
    });
})(jQuery);