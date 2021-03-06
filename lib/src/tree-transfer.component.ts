import {Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {NzFormatEmitEvent, NzTreeComponent, NzTreeNode, NzTreeNodeOptions} from 'ng-zorro-antd';
import * as _ from 'lodash';

@Component({
  selector: 'nz-tree-transfer',
  templateUrl: './tree-transfer.component.html',
  styleUrls: ['./tree-transfer.component.scss']
})
export class TreeTransferComponent implements OnInit {
  @Input() titles: string[] | TemplateRef<void>[] = ['源数据', '目的数据'];
  @Input() source: NzTreeNodeOptions[] = [];
  @Input() private target: string[] = [];
  @Input() showSearch = false;
  @Input() footer: string[] | TemplateRef<void>[];
  @Input() treeExpandAll = false;
  @Input() nzSearchPlaceholder = '请输入要搜索的内容';
  @Output() readonly nzSearchChange = new EventEmitter<object>();
  @Output() readonly nzChange = new EventEmitter<object>();
  treeSearchValue = '';
  listSearchValue = '';
  listData: NzTreeNodeOptions[] = [];
  listCheckedKeys: string[] = [];
  treeCheckedKeys: string[] = [];
  treeExpandedKeys: string[] = [];
  leafKeys: string[] = [];
  private allKeys: Array<any> = [];
  @ViewChild('tree') private tree: NzTreeComponent;

  constructor() { }

  ngOnInit() {
    this.initData(this.source);
    this.treeCheckedKeys = this.listData.map(item => item.key);
    this.treeExpandedKeys = this.treeCheckedKeys;
  }

  initData(source: NzTreeNodeOptions[]) {
    source.map(item => {
      if (this.target.indexOf(item.key) > -1) {
        this.listData.push(item);
      }
      if (!item.children) {
        this.leafKeys.push(item.key);
      } else {
        this.initData(item.children);
      }
    });
  }

  leftToRight() {
    this.target = this.treeCheckedKeys;
    this.listData = [];
    this.initData(this.tree.getTreeNodes());
    this.moveChange(this.target, 'tree');
  }

  rightToLeft() {
    this.target = this.listData.map(item => item.key).filter(key => this.listCheckedKeys.indexOf(key) < 0);
    this.listData = [];
    this.initData(this.tree.getTreeNodes());
    this.listCheckedKeys = [];
    this.treeCheckedKeys = this.listData.map(item => item.key);
    this.moveChange(this.target, 'list');
  }

  treeOnCheck(event: NzFormatEmitEvent): void {
    this.allKeys = [];
    this.getTreeCheckedKeys(this.tree.getCheckedNodeList());
    this.treeCheckedKeys = this.allKeys.filter(key => this.leafKeys.indexOf(key) > -1);
  }

  treeOnCheckAll(e: boolean) {
    if (e) {
      this.treeCheckedKeys = this.leafKeys;
    } else {
      this.treeCheckedKeys = [];
    }
  }

  listOnCheck(e: boolean, checkedKeys: string[]) {
    if (e) {
      this.listCheckedKeys = _.uniq([...this.listCheckedKeys, ...checkedKeys]);
    } else {
      this.listCheckedKeys = this.listCheckedKeys.filter(key => checkedKeys.indexOf(key) < 0);
    }
  }

  listOnCheckAll(e: boolean) {
    this.listOnCheck(e, this.listData.map(item => item.key));
  }

  getTreeCheckedKeys(source: NzTreeNode[]) {
    source.map(item => {
      if (item.isChecked) {
        this.allKeys.push(item.key);
      }
      if (item.children.length > 0) {
        this.getTreeCheckedKeys(item.children);
      }
    });
  }

  get getLeftDisabled(): boolean {
    return _.difference(this.listData.map(item => item.key), this.treeCheckedKeys).length === 0 &&
      _.difference(this.treeCheckedKeys, this.listData.map(item => item.key)).length === 0;
  }

  showListSearchValue(item: NzTreeNodeOptions): boolean {
    return this.listSearchValue.length > 0 && item.title.indexOf(this.listSearchValue) > -1;
  }

  listSearch(e) {
    this.listSearchValue = e.target.value;
    this.searchChange(this.listSearchValue, 'list');
  }

  treeSearch(e) {
    this.treeSearchValue = e.target.value;
    this.searchChange(this.treeSearchValue, 'tree');
  }

  searchChange(value: string, type: 'list' | 'tree') {
    this.nzSearchChange.emit({value, type});
  }

  moveChange(value: string[], type: 'list' | 'tree') {
    this.nzChange.emit({value, type});
  }

}
