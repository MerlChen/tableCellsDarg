var tableOperationDom = {
	domInfo:null;
};
var rightMenu = null;
var content = null;
var menu = null;
/**
 * 初始化时根据传递过来的Id,对HTML内容进行填塞;
 * 执行表格Id的初始化处理
 * 如果浏览器为Firefox时,需要重新执行一次处理;
 */
function init(contentId,menuId){
	content = $("#"+contentId);
	menu = $("#"+menuId);
	$("#menuList").html(html);
	setTimeout(function(){
		tableInfoSet(contentId);
	},200);
	var browser = checkBrowser();
	if(browser === 'FF'){
		setTimeout(function(){
			tableInfoSet(contentId);
		},200);
	}
}
/**
 * 在内容填充器内执行右键操作时,进行当前选择的标签名称进行校验
 * 如果是在表格单元格内,执行右键自定义菜单的显示
 * 如果不是的话,执行右键菜单显示隐藏
 */
content.oncontextmenu = function(e){
	if(e.target.localName === 'td' || e.target.localName === 'th'){
		var domEvent = event || window.event;
		tableOperationDom.domInfo = domEvent.target;
		rightMenu.css({'display':'block','left':domEvent.clientX + '9','top':domEvent.clientY - '9'});
		return false;
	} else{
		hideMenu();
	}
};
/**
 * 如果不是的话,执行右键菜单显示隐藏
 * 在容器内进行单击时,执行自定义右键菜单的显示隐藏
 */
content.onclick = function(){
	hideMenu();
};
/**
 * 执行右键菜单的隐藏显示
 */
function hideMenu(){
	menu.css("display","none");
}
/**
 * 表格Id的存在校验或赋值
 */
function tableInfoSet(contentId){
	var table = $("#"+contentId).find('table');
	for(var i = 0,t = table.length; i < t ; i++){
		if(table[i].attr("id").length > 0){
			setTableCellsDrag(table[i].attr("id"));
		} else{
			table[i].id = "table_" + (Math.random().toFixed(8)*100000000);
			setTableCellsDrag(table[i].id);
		}
	}
}
/**
 * 对表格列宽拖拽调整核心内容
 * 根据传递过来的表格id,执行对应事件处理
 */
function setTableCellsDrag(tId){
	//	定义变量用于存储当前更改的Table Cell
	var tableCell;
	//	根据传递过来的TableId查询出DOM结构信息
	var table = $("#"+tId);
	//	定义变量存储当前表格的宽度
	var tableWidth = $("#"+tId).offsetWidth;
	//	循环处理，对表格的每一行中的每一列都增加对应事件绑定
	for(var r = 0 ; r < table.rows.length; r++){
		for(var j = 0 ; j < table.rows[0].cells.length; j++){
			//	判断表格的列宽是否存在百分比宽度设置,如果存在,将其转化为像素
			if((table.rows[r].cells[j].width).indexOf("%") > -1){
				table.rows[r].cells[j].width = (table.rows[r].cells[j].width.replace("%","")/100*tableWidth).toFixed(0);
			}
			//	给表格的每一行中的每一列增加左键按下绑定事件
			$(table.rows[r].cells[j]).mousedown(function(e){
				if(!e){
					e = window.event;
				}
				//	存储当前点击的单元格
				tableCell = this;
				if(e.originalEvent.offsetX > tableCell.offsetWidth - 10){
					tableCell.mouseDown = true;
					tableCell.oldX = e.originalEvent.x;
					tableCell.oldWidth = tableCell.offsetWidth;
				}
			});
			$(table.rows[row].cells[j]).mouseup(function(){
				if(tableCell === undefined){
					tableCell = this;
				}
				tableCell.mouseDown = false;
				tableCell.style.cursor = 'default';
			});
			$(table.rows[r].cells[j]).mousemove(function(e){
				if(!e){
					e = window.event;
				}
				if(e.originalEvent.offsetX > this.offsetWidth - 10){
					this.style.cursor = 'col-resize';
				} else{
					this.style.cursor = 'default';
				}
				if(tableCell === undefined){
					tableCell = this;
				}
				if(tableCell.mouseDown !== null && tableCell.mouseDown === true){
					tableCell.style.cursor = 'default';
					if(tableCell.oldWidth + (e.originalEvent.x - tableCell.oldX) > 0 ){
						tableCell.width = tableCell.oldWidth + (e.originalEvent.x - tableCell.oldX);
					}
					tableCell.style.cursor = 'col-resize';
					table = tableCell;
					if(table.tagName !== 'TABLE'){
						table = table.parentElement;
					}
					for(var m = 0 ; m < table.rows.length; m++){
						table.rows[m].cells[tableCell.cellIndex].width = tableCell.width;
					}
				}
			});
		}
	}
}