define([
	"text!./tableOperation.html",
], function(html) {
	var tableOperationDom = {
		domInfo: null
	};
	var rightMenu = null;

	function onReady() {
		$("#menuList").html(html);
		setTimeout(function() {
			tableInfoSet();
		}, 200);
		var browser = checkBrowser();
		if(browser === 'FF') {
			setTimeout(function() {
				tableInfoSet();
			}, 200);
		}
		//富文本编辑器内右侧菜单设置
		var oDiv = document.getElementById('receiptPrintSetting_receipt');
		var rightMenu = document.getElementById('tableRightMenu');
		oDiv.oncontextmenu = function(event) {
			/**
			 * 判断是否在表格范围内执行的右键操作
			 * 如果在表格范围内执行的右键操作，显示自定义菜单
			 */
			if(event.target.localName === 'td' || event.target.localName === 'tr' || event.target.localName === 'th') {
				var domEvent = event || window.event;
				tableOperationDom.domInfo = domEvent.target;
				getTableLocationInfo(true);
				rightMenu.style.display = "block";
				rightMenu.style.left = domEvent.clientX + 9 + "px";
				rightMenu.style.top = domEvent.clientY - 9 + "px";
				return false;
			}
			/**
			 * 否则隐藏右键菜单-为防止出现两个菜单
			 */
			else {
				hideRightMenu();
			}
		}
		oDiv.onclick = function() {
			hideRightMenu();
		}
		$("#tableRightMenu li").click(function() {
			menuListClick(this.id);
			hideRightMenu();
		});

	}

	function hideRightMenu() {
		document.getElementById('tableRightMenu').style.display = "none";
	}
	/**
	 * 点击菜单的选项时，执行隐藏自定义菜单
	 */
	/**
	 * 获取当前点击的单元格是第几个单元格
	 * 决定是否保留合并单元格、拆解当前单元格的操作
	 */
	function getTableLocationInfo(checkNum) {
		var colInfo = $(tableOperationDom.domInfo);
		var rowInfo = colInfo.parent();
		var rowIndex = rowInfo[0].rowIndex;
		var table = (rowInfo.parent().parent())[0];
		var colIndex = colInfo[0].cellIndex;
		var rowLength = table.rows.length;
		if(checkNum) {
			/**
			 * 是否显示向左合并
			 */
			if(table.rows[rowIndex].cells.length === 1) {
				$("#mergeCols").hide();
			} else {
				$("#mergeCols").show();
				if(colIndex === 0) {
					$("#mergeLeft").hide();
				} else {
					$("#mergeLeft").show();
				}
				/**
				 * 是否显示向右合并
				 */
				if(colIndex === (rowInfo[0].cells.length - 1)) {
					$("#mergeRight").hide();
				} else {
					$("#mergeRight").show();
				}
			}
			/**
			 * 是否显示向下合并
			 */
			if(rowIndex === (rowLength - 1)) {
				$('#mergeAfter').hide();
			} else {
				$("#mergeAfter").show();
			}
			/**
			 * 是否显示删除此行
			 */
			if(rowLength > 1) {
				$("#deleteRow").show();
			} else {
				$("#deleteRow").hide();
			}
			/**
			 * 是否显示删除此列
			 */
			if(table.rows[0].cells.length > 1) {
				$("#deleteCol").show();
			} else {
				$("#deleteCol").hide();
			}
			/**
			 * 是否显示拆分操作
			 */
			if((colInfo[0].rowSpan && colInfo[0].rowSpan > 1) || (colInfo[0].colSpan && colInfo[0].colSpan > 1)) {
				$("#tableCellsSplit").show();
				/**
				 * 是否显示拆分成行
				 */
				if(colInfo[0].rowSpan && colInfo[0].rowSpan > 1) {
					$("#splitRow").show();
				} else {
					$("#splitRow").hide();
				}
				/**
				 * 是否显示拆分成列
				 */
				if(colInfo[0].colSpan && colInfo[0].colSpan > 1) {
					$("#splitCol").show();
				} else {
					$("#splitCol").hide();
				}
			} else {
				$("#tableCellsSplit").hide();
			}
		} else {
			return colInfo.cellIndex;
		}
	}
	/**
	 * 表格操作菜单对应点击事件
	 */

	function menuListClick(thisId) {
		/**
		 * 此行操作
		 */
		if(thisId === 'addRowBefore' || thisId === 'addRowAfter' || thisId === 'deleteRow') {
			var tdDomInfo = $(tableOperationDom.domInfo);
			var trDomInfo = tdDomInfo.parent();
			var table = (trDomInfo.parent().parent())[0];
			var tdLength = table.rows[0].cells.length;
			var cellLength = 0;
			var rowIndex = trDomInfo[0].rowIndex;
			var colIndex = tdDomInfo[0].cellIndex;
			var newRow = null;
			var effectRows = [];
			for(var i = 0; i < tdLength; i++) {
				cellLength++;
				if(table.rows[0].cells[i].colSpan > 1) {
					cellLength = cellLength + (table.rows[0].cells[i].colSpan) - 1;
				}
			}
			/**
			 * 上插入行功能
			 * 目前已实现的场景
			 * 1、当前行中的上方的行存在行合并的情况
			 * 2、当前行中的上方的行不存在行合并的情况
			 * 3、当前行中的列存在列合并的情况
			 * 4、当前行的中不存在列合并的情况
			 * 
			 * TODO
			 * 目前暂无需要处理的情况（无已知的需要考虑的情况）
			 */
			if(thisId === 'addRowBefore') {
				//	遍历整个表格，获取到该上上方的所有行
				for(var i = 0; i < table.rows.length; i++) {
					//	获取到当前行的上面的行
					if(i < rowIndex) {
						//	查看上方的行，是否存在行合并的情况
						for(var x = 0; x < table.rows[i].cells.length; x++) {
							//	如果存在行合并的情况且影响到了本行的上方增加行功能，将该行的该列以对象形式存入到数组中，用来后面做判断处理
							if(table.rows[i].cells[x].rowSpan > 1 && ((table.rows[i].cells[x].rowSpan - 1 + i) > (rowIndex - 1))) {
								var effectDom = {
									"rows": i,
									"cells": x
								}
								effectRows.push(effectDom);
							}
						}
					}
				}
				//	如果存在受影响的对象执行操作
				if(effectRows.length && effectRows.length >= 1) {
					//	将此行克隆一份
					newRow = trDomInfo.clone();
					//	将单元格的行合并取消
					for(var l = 0; l < newRow[0].cells.length; l++) {
						newRow[0].cells[l].innerHTML = "";
						newRow[0].cells[l].rowSpan = 1;
						//	克隆行中的某一列存在列合并的情况，将该列的合并值设置成1,且将该克隆行增加对应的个数
						if(newRow[0].cells[l].colSpan > 1) {
							newRow[0].cells[l].colSpan = 1;
							for(var newCell = 1; newCell < newRow[0].cells[l].colSpan; newCell++) {
								newRow[0].insertCell(newCell);
							}
						}
					}
					//	在此行上方插入被克隆的行
					trDomInfo.before(newRow);
					//	将影响到的数组中的对应行中的对应列的rowSpan累增
					for(var m = 0; m < effectRows.length; m++) {
						table.rows[effectRows[m].rows].cells[effectRows[m].cells].rowSpan = table.rows[effectRows[m].rows].cells[effectRows[m].cells].rowSpan + 1;
					}
					//	如果上方的行合并功能不影响该行上方增加行的功能，直接在此行上方增加一行，将其列的个数设置为第一行未合并时的列的个数
				} else {
					newRow = table.insertRow(rowIndex);
					for(var i = 0; i < cellLength; i++) {
						newRow.insertCell(i);
					}
				}
			}
			/**
			 * TODO
			 * 下插入行功能
			 * 目前已实现的场景：
			 * 1、当前行存在行合并情况
			 * 2、当前行不存在行合并情况
			 * 3、当前行的行合并个数非常多
			 */
			else if(thisId === 'addRowAfter') {
				//	遍历表格的所有行，查看是否拥有影响到当前行往下插入行的行合并情况
				for(var i = 0; i < table.rows.length; i++) {
					for(var c = 0; c < table.rows[i].cells.length; c++) {
						//	如果表格的行存在行合并情况
						if(table.rows[i].cells[c].rowSpan > 1) {
							if((table.rows[i].cells[c].rowSpan - 1 + i) > (rowIndex)) {
								var effectDom = {
									"rows": i,
									"cells": c
								};
								effectRows.push(effectDom);
							}
						}
					}
				}
				//	如果表格中的行不存在行合并或者行合并的情况，不影响当前行往下插入行的功能.直接往该行下方插入一行，列数为表格第一行的列数（如果存在列合并情况，则取消所有列合并）
				if(effectRows.length === 0) {
					newRow = table.insertRow(rowIndex + 1);
					for(var i = 0; i < cellLength; i++) {
						newRow.insertCell(i);
					}
				}
				//	
				else {
					newRow = trDomInfo.clone();
					//	遍历受影响的对象
					var hasFinished = false;
					for(var h = 0; h < effectRows.length; h++) {
						//	如果存在行合并的行，是该行,
						var count = 0;
						if((rowIndex === effectRows[h].rows) && !hasFinished) {
							//	将单元格的行合并取消,将新增的行，减去受影响的行的个数
							//	获取当前行的存在行合并的列的个数
							for(var num = 0; num < effectRows.length; num++) {
								if(effectRows[num].rows === rowIndex) {
									count++;
								}
							}
							for(var l = 0; l < newRow[0].cells.length; l++) {
								newRow[0].cells[l].innerHTML = "";
								newRow[0].cells[l].rowSpan = 1;
								//	克隆行中的某一列存在列合并的情况，将该列的合并值设置成1,且将该克隆行增加对应的个数
								if(newRow[0].cells[l].colSpan > 1) {
									newRow[0].cells[l].colSpan = 1;
									for(var newCell = 1; newCell < newRow[0].cells[l].colSpan; newCell++) {
										newRow[0].insertCell(newCell);
									}
								}
							}
							//	移除对应的列数
							for(var n = 0; n < count; n++) {
								newRow[0].cells[n].remove();
							}
							hasFinished = true;
						}
						//	如果存在行合并的行，不是该行
						else {
							//	将单元格的行合并取消
							for(var l = 0; l < newRow[0].cells.length; l++) {
								newRow[0].cells[l].innerHTML = "";
								newRow[0].cells[l].rowSpan = 1;
								//	克隆行中的某一列存在列合并的情况，将该列的合并值设置成1,且将该克隆行增加对应的个数
								if(newRow[0].cells[l].colSpan > 1) {
									newRow[0].cells[l].colSpan = 1;
									for(var newCell = 1; newCell < newRow[0].cells[l].colSpan; newCell++) {
										newRow[0].insertCell(newCell);
									}
								}
							}
						}
					}
					//	在此行下方插入被克隆的行
					trDomInfo.after(newRow);
					//	将影响到的数组中的对应行中的对应列的rowSpan累增
					for(var m = 0; m < effectRows.length; m++) {
						table.rows[effectRows[m].rows].cells[effectRows[m].cells].rowSpan = table.rows[effectRows[m].rows].cells[effectRows[m].cells].rowSpan + 1;
					}
				}
			}
			/**
			 * 行删除功能
			 * 考虑到的场景：
			 * 1、即将删除的行，存在行合并功能
			 * 2、即将删除的行，不存在行合并功能
			 */
			else {
				//	遍历表格的所有行，查看是否拥有影响到当前行删除功能的情况
				for(var i = 0; i < table.rows.length; i++) {
					for(var c = 0; c < table.rows[i].cells.length; c++) {
						//	如果表格的行存在行合并情况
						if(table.rows[i].cells[c].rowSpan > 1) {
							if((table.rows[i].cells[c].rowSpan - 1 + i) >= (rowIndex)) {
								var effectDom = {
									"rows": i,
									"cells": c
								};
								effectRows.push(effectDom);
							}
						}
					}
				}
				//	遍历受影响的行，判断即将被删除的行，是否存在行合并的情况
				for(var m = 0; m < effectRows.length; m++) {
					//	先将此列的行合并拆分成行
					var tdRowSpan = table.rows[effectRows[m].rows].cells[effectRows[m].cells].rowSpan;
					table.rows[effectRows[m].rows].cells[effectRows[m].cells].rowSpan = 1;
					for(var i = 1; i < tdRowSpan; i++) {
						table.rows[effectRows[m].rows + i].insertCell(effectRows[m].cells + i)
					}
				}
				trDomInfo.remove();
				//	将影响到的数组中的对应行中的对应列的rowSpan累增
				for(var m = 0; m < effectRows.length; m++) {
					table.rows[effectRows[m].rows].cells[effectRows[m].cells].rowSpan = table.rows[effectRows[m].rows].cells[effectRows[m].cells].rowSpan - 1;
				}
			}
		}
		/**
		 * 此列操作
		 */
		if(thisId === 'addColRight' || thisId === 'addColLeft' || thisId === 'deleteCol') {
			var tdDomInfo = $(tableOperationDom.domInfo);
			var trDomInfo = tdDomInfo.parent();
			var colIndex = tdDomInfo[0].cellIndex;
			var rowIndex = trDomInfo[0].rowIndex;
			var table = (trDomInfo.parent().parent())[0];
			var rowLength = table.rows.length;
			var hasColSpan = false;
			//	判断表格中是否存在合并列情况
			for(var i = 0; i < table.rows.length; i++) {
				for(var c = 0; c < table.rows[i].cells.length; c++) {
					if(table.rows[i].cells[c].colSpan > 1) {
						hasColSpan = true;
					}
				}
			}

			if(thisId === 'addColLeft' || thisId === 'addColRight') {
				var _thisId = thisId;
				//	如果存在列合并的情况
				if(hasColSpan && (colIndex > 0)) {
					/**
					 * TODO 
					 * 左/右插入列功能实现：
					 * 1、获取到当前行的当前列
					 * 2、获取当前行的当前列左侧的总单元格数 colNum;
					 * 3、获取每一行的当前单元格数量的下标进行数组对象存储
					 * 4、对数组进行循环遍历
					 * 5、判断数组中的当前对象是否存在列合并的情况，如果存在列合并，那么将当前的列合并值+1，如果不存在列合并情况，在数组对象行中的对象列+1前进行单元格插入 -- 左插入列
					 * 6、判断数组中的当前对象是否存在列合并的情况，如果存在列合并，那么将当前的列合并值+1，如果不存在列合并情况，在数组对象行中的对象列+2前进行单元格插入 -- 右插入列
					 */
					if(_thisId === 'addColLeft' || _thisId === 'addColRight') {
						var colNum = 0;
						for(var i = 0; i < table.rows[rowIndex].cells.length; i++) {
							if(i < colIndex && _thisId === 'addColLeft') {
								colNum = colNum + table.rows[rowIndex].cells[i].colSpan;
							} else if(_thisId === 'addColRight' && i <= colIndex) {
								colNum = colNum + table.rows[rowIndex].cells[i].colSpan;
							}
						}
						var colList = [];
						for(var i = 0; i < table.rows.length; i++) {
							var thisRowColNum = 0;
							for(var c = 0; c < table.rows[i].cells.length; c++) {
								thisRowColNum = thisRowColNum + table.rows[i].cells[c].colSpan;
								if(thisRowColNum >= colNum) {
									var colInfo = {
										"rows": i,
										"cells": c
									};
									colList.push(colInfo);
									break;
								}
							}
						}
						colList.forEach(function(item) {
							if(table.rows[item.rows].cells[item.cells].colSpan === 1) {
								if(_thisId === 'addColLeft') {
									(table.rows[item.rows].insertCell(item.cells + 1)).style.width = '10%';
								} else if(_thisId === 'addColRight') {
									(table.rows[item.rows].insertCell(item.cells + 1)).style.width = '10%';
								}
							} else {
								table.rows[item.rows].cells[item.cells].colSpan = table.rows[item.rows].cells[item.cells].colSpan + 1;
							}
						});
					}
				}
				//	不存在列合并的情况
				if(!hasColSpan || (hasColSpan && (colIndex === 0))) {
					for(var i = 0; i < rowLength; i++) {
						if(_thisId === 'addColRight') {
							(table.rows[i].insertCell(colIndex + 1)).style.width = '10%';
						} else if(_thisId === 'addColLeft') {
							(table.rows[i].insertCell(colIndex)).style.width = '10%';
						}
					}
				}
			}
			/**
			 * TODO
			 * 删除此列功能
			 */
			else if(thisId === 'deleteCol') {
				if(hasColSpan) {
					var colNum = 0;
					for(var i = 0; i < table.rows[rowIndex].cells.length; i++) {
						if(i <= colIndex) {
							colNum = colNum + table.rows[rowIndex].cells[i].colSpan;
						}
					}
					var colList = [];
					for(var i = 0; i < table.rows.length; i++) {
						var thisRowColNum = 0;
						for(var c = 0; c < table.rows[i].cells.length; c++) {
							thisRowColNum = thisRowColNum + table.rows[i].cells[c].colSpan;
							if(thisRowColNum >= colNum) {
								var colInfo = {
									"rows": i,
									"cells": c
								};
								colList.push(colInfo);
								break;
							}
						}
					}
					colList.forEach(function(item) {
						if(table.rows[item.rows].cells[item.cells].colSpan > 1) {
							table.rows[item.rows].cells[item.cells].colSpan = table.rows[item.rows].cells[item.cells].colSpan - 1;
						} else {
							table.rows[item.rows].cells[item.cells].remove();
						}
					});
				} else {
					for(var i = 0; i < table.rows.length; i++) {
						table.rows[i].cells[colIndex].remove();
					}
				}
			}
		}
		/**
		 * 拆分操作
		 */
		if(thisId === 'splitCol' || thisId === 'splitRow') {
			var tdDomInfo = $(tableOperationDom.domInfo);
			var trDomInfo = tdDomInfo.parent();
			var colIndex = tdDomInfo[0].cellIndex;
			var rowIndex = trDomInfo[0].rowIndex;
			var colSpan = tdDomInfo[0].colSpan;
			var rowSpan = tdDomInfo[0].rowSpan;
			var table = (trDomInfo.parent().parent())[0];
			if(thisId === 'splitCol') {
				tdDomInfo[0].colSpan = 1;
				for(var i = 1; i < colSpan; i++) {
					tdDomInfo.after("<td></td>");
				}
			} else {
				tdDomInfo[0].rowSpan = 1;
				for(var i = 1; i < rowSpan; i++) {
					(table.rows[rowIndex + i].insertCell(colIndex)).colSpan = tdDomInfo[0].colSpan;
				}
			}
		}
		/**
		 * 合并操作
		 */
		if(thisId === 'mergeRight' || thisId === 'mergeLeft' || thisId === 'mergeAfter') {
			var tdDomInfo = $(tableOperationDom.domInfo);
			var trDomInfo = tdDomInfo.parent();
			var colIndex = tdDomInfo[0].cellIndex;
			var table = (trDomInfo.parent().parent())[0];
			var rowIndex = trDomInfo[0].rowIndex;
			if(thisId === 'mergeLeft') {
				tdDomInfo[0].colSpan = tdDomInfo[0].colSpan + trDomInfo[0].cells[colIndex - 1].colSpan;
				tdDomInfo[0].innerHTML = tdDomInfo[0].innerHTML + table.rows[rowIndex].cells[colIndex - 1].innerHTML;
				table.rows[rowIndex].cells[colIndex - 1].remove();
			} else if(thisId === 'mergeRight') {
				tdDomInfo[0].colSpan = tdDomInfo[0].colSpan + trDomInfo[0].cells[colIndex + 1].colSpan;
				tdDomInfo[0].innerHTML = tdDomInfo[0].innerHTML + table.rows[rowIndex].cells[colIndex + 1].innerHTML;
				table.rows[rowIndex].cells[colIndex + 1].remove();
			}
			/**
			 * 向下合并功能：
			 * 1、
			 */
			else if(thisId === 'mergeAfter') {
				var hasMerged = false;
				var effectThisRow = 0;
				var effectNextRow = 0;
				var isThisRow = false;
				//	遍历表格，获取表格中的所有行
				for(var i = 0; i < table.rows.length; i++) {
					//	获取表格中的所有行中的所有列
					for(var c = 0; c < table.rows[i].cells.length; c++) {
						if(table.rows[i].cells[c].rowSpan > 1) {
							hasMerged = true;
							if(rowIndex === i) {
								isThisRow = true;
							}
							if(rowIndex <= (i + table.rows[i].cells[c].rowSpan - 1)) {
								effectThisRow++;
							}
							if((rowIndex + 1) <= (i + table.rows[i].cells[c].rowSpan - 1)) {
								effectNextRow++;
							}
							//							for(var num = 1; num < table.rows[i].cells[c].rowSpan; num ++){
							//								
							//								//	首先判断当前表格存在行合并的行，是否有到此行的合并
							//								//	判断到此行的合并的数量有多少
							//								//	判断是否有到此行的下一行的合并
							//								//	判断到此行的下一行的合并的数量有多少
							//								//	到此行的合并数量：2、到此行的下一行合并的数量:4.colIndex = 5;
							//								//	当前点击列 table.rows[rowIndex].cells[colIndex]
							//								//	当前点击列的下一行的此列 table.rows[rowIndex + 1].cells[colIndex + n - x];
							//								
							////								if((rowIndex === (i + num - 1)) && (table.rows[rowIndex].cells[colIndex].rowSpan === 1) && (table.rows[rowIndex + 1].cells[colIndex].rowSpan === 1)){
							////									table.rows[rowIndex].cells[colIndex].innerHTML = table.rows[rowIndex].cells[colIndex].innerHTML + table.rows[rowIndex + 1].cells[colIndex].innerHTML;
							////									table.rows[rowIndex + 1].cells[colIndex].innerHTML = "";
							////									table.rows[rowIndex + 1].cells[colIndex].remove();
							////									table.rows[rowIndex].cells[colIndex].rowSpan = 2;
							////								}
							////								else{
							////									table.rows[rowIndex].cells[colIndex].innerHTML = table.rows[rowIndex].cells[colIndex].innerHTML + table.rows[rowIndex + 1].cells[colIndex].innerHTML;
							////									table.rows[rowIndex + 1].cells[colIndex].innerHTML = "";
							////									table.rows[rowIndex].cells[colIndex].rowSpan = table.rows[rowIndex].cells[colIndex].rowSpan + table.rows[rowIndex + 1].cells[colIndex].rowSpan;
							////									table.rows[rowIndex + 1].cells[colIndex].remove();
							////								}
							//							}
						}
					}
				}
				if(hasMerged) {
					if(isThisRow) {
						table.rows[rowIndex].cells[colIndex].innerHTML = table.rows[rowIndex].cells[colIndex].innerHTML + table.rows[rowIndex + 1].cells[colIndex - effectThisRow].innerHTML;
						table.rows[rowIndex + 1].cells[colIndex - effectThisRow].innerHTML = "";
						table.rows[rowIndex].cells[colIndex].rowSpan = table.rows[rowIndex].cells[colIndex].rowSpan + table.rows[rowIndex + 1].cells[colIndex - effectThisRow].rowSpan;
						table.rows[rowIndex + 1].cells[colIndex - effectThisRow].remove();

						//						if(effectThisRow === effectNextRow) {
						//							table.rows[rowIndex].cells[colIndex].innerHTML = table.rows[rowIndex].cells[colIndex].innerHTML + table.rows[rowIndex + 1].cells[colIndex].innerHTML;
						//							table.rows[rowIndex + 1].cells[colIndex].innerHTML = "";
						//							table.rows[rowIndex].cells[colIndex].rowSpan = table.rows[rowIndex].cells[colIndex].rowSpan + table.rows[rowIndex + 1].cells[colIndex].rowSpan;
						//							table.rows[rowIndex + 1].cells[colIndex].remove();
						//						} else {
						//							table.rows[rowIndex].cells[colIndex].innerHTML = table.rows[rowIndex].cells[colIndex].innerHTML + table.rows[rowIndex + 1].cells[colIndex + effectThisRow - effectNextRow - 1].innerHTML;
						//							table.rows[rowIndex + 1].cells[colIndex + effectThisRow - effectNextRow].innerHTML = "";
						//							table.rows[rowIndex].cells[colIndex].rowSpan = table.rows[rowIndex].cells[colIndex].rowSpan + table.rows[rowIndex + 1].cells[colIndex + effectThisRow - effectNextRow - 1].rowSpan;
						//							table.rows[rowIndex + 1].cells[colIndex + effectThisRow - effectNextRow - 1].remove();
						//						}
					} else {
						table.rows[rowIndex].cells[colIndex].innerHTML = table.rows[rowIndex].cells[colIndex].innerHTML + table.rows[rowIndex + 1].cells[colIndex + effectThisRow - effectNextRow].innerHTML;
						table.rows[rowIndex + 1].cells[colIndex + effectThisRow - effectNextRow].innerHTML = "";
						table.rows[rowIndex].cells[colIndex].rowSpan = table.rows[rowIndex].cells[colIndex].rowSpan + table.rows[rowIndex + 1].cells[colIndex + effectThisRow - effectNextRow].rowSpan;
						table.rows[rowIndex + 1].cells[colIndex + effectThisRow - effectNextRow].remove();
					}
				}
				if(!hasMerged) {
					table.rows[rowIndex].cells[colIndex].innerHTML = table.rows[rowIndex].cells[colIndex].innerHTML + table.rows[rowIndex + 1].cells[colIndex].innerHTML;
					table.rows[rowIndex + 1].cells[colIndex].innerHTML = "";
					table.rows[rowIndex + 1].cells[colIndex].remove();
					table.rows[rowIndex].cells[colIndex].rowSpan = 2;
				}

			}
		}
		setTimeout(function() {
			tableInfoSet();
		}, 1);
	};
	/**
	 * 隐藏右键菜单
	 */

	function checkBrowser() {
		var userAgent = navigator.userAgent;
		var isOpera = userAgent.indexOf("Opera") > -1;
		if(isOpera) {
			return "Opera";
		}
		if(userAgent.indexOf("Firefox") > -1) {
			return "FF";
		}
		if(userAgent.indexOf("Chrome") > -1) {
			return "Chrome";
		}
		if(userAgent.indexOf("Safari") > -1) {
			return "Safari";
		}
		if(userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera) {
			return "IE";
		}
	}

	/**
	 * 获取到富文本编辑器的的所有表格
	 * 并对表格执行一个随机的ID
	 */
	function tableInfoSet() {
		var table = $("#receiptPrintSetting_receipt table");
		var tableNum = table.length;
		for(var i = 0; i < tableNum; i++) {
			table[i].id = "table_" + (Math.random().toFixed(8)) * 100000000;
			setTableCellsDrag(table[i].id);
		}

	}
	/**
	 * Author:Louis
	 * Time: 2017/12/05
	 * Effect: 实现表格列宽度拖动调整
	 * 根据表格ID，动态对表格的列添加对应的事件
	 * mousedown：当鼠标在列边按下时，记录该列对象
	 * mouseup：当鼠标松开时执行表格列状态的还原操作
	 * mousemoveL：当表格列的鼠标拖动时执行表格列宽度的重新绘制和计算操作
	 * @param {Object} tableId
	 */
	function setTableCellsDrag(tableId) {
		var tableCell; // 用于存储当前更改的table Cell
		var table = document.getElementById(tableId); // 用于存储根据表格ID获取到的表格对象
		var tableWidth = document.getElementById(tableId).offsetWidth; // 用于存储表格ID获取到的表格对象的宽度
		for(row = 0; row < table.rows.length; row++) {
			for(j = 0; j < table.rows[0].cells.length; j++) {
				//	如果表格的某一列是用%定义的宽度，则将其转化为像素的形式，否则无法实现列拖拽功能
				if((table.rows[0].cells[j].width).indexOf("%") > -1){
					table.rows[0].cells[j].width = (table.rows[0].cells[j].width.replace("%","")/100 * tableWidth).toFixed(0);
				}
				// 当表格某一列的列边鼠标按下时触发该操作
				$(table.rows[row].cells[j]).mousedown(function(e) {
					if(!e) {
						e = window.event;
					}
					tableCell = this; //	存储当前的表格列
					if(e.originalEvent.offsetX > tableCell.offsetWidth - 10) {
						tableCell.mouseDown = true;
						tableCell.oldX = e.originalEvent.x;
						tableCell.oldWidth = tableCell.offsetWidth;
					}
				});
				//	在表格列的鼠标松开时，执行表格列的对应设置(还原鼠标样式，取消鼠标按下事件)
				$(table.rows[row].cells[j]).mouseup(function() {
					if(tableCell == undefined) tableCell = this;
					tableCell.mouseDown = false;
					tableCell.style.cursor = 'default';
				});
				//	在表格列的鼠标移动过程中，执行表格列的宽度动态调整，并对样式进行对应设置
				$(table.rows[row].cells[j]).mousemove(function(e) {
					if(!e) {
						e = window.event;
					}
					if(e.originalEvent.offsetX > this.offsetWidth - 10) {
						this.style.cursor = 'col-resize';
					} else {
						this.style.cursor = 'default';
					}
					if(tableCell == undefined) {
						tableCell = this;
					}
					if(tableCell.mouseDown != null && tableCell.mouseDown == true) {
						tableCell.style.cursor = 'default';
						if(tableCell.oldWidth + (e.originalEvent.x - tableCell.oldX) > 0)
							tableCell.width = tableCell.oldWidth + (e.originalEvent.x - tableCell.oldX);
						tableCell.style.cursor = 'col-resize';
						table = tableCell;
						while(table.tagName != 'TABLE') table = table.parentElement;
						for(j = 0; j < table.rows.length; j++) {
							table.rows[j].cells[tableCell.cellIndex].width = tableCell.width;
						}
					}
				});
			}
		}
	}
	return {
		tableInfoSet: tableInfoSet,
		onReady: onReady,
		menuListClick: menuListClick,
		hideRightMenu: hideRightMenu
	}
});
