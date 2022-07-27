import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NzImageService } from 'ng-zorro-antd/image';



@Component({
  selector: 'help-doc',
  templateUrl: './help-doc.component.html',
  styleUrls: ['./help-doc.component.less'],
})



export class HelpDocComponent implements OnInit {
  activeIndex = 0;
  offset = 50;
  timer;
  menuTree = [];
  menuList = [];
  expandedKeys = [];
  activeDom:any;
  constructor(public nzImageService: NzImageService, private cd: ChangeDetectorRef) {}
  messagee = ''
  ngOnInit() {
    setTimeout(() => {
      this.setMenu();
      const nav = <any>document.getElementsByClassName('alain-default__aside')[0]
      const icon = <any>document.getElementsByClassName('alain-default__nav-item')[0]
      nav.style.display = 'none';
      icon.style.display = 'none';
    })
  }

  setMenu() {
    let markdown = <HTMLCollection>document.getElementsByClassName('markdown')[0].children[0].children;
    let markdownArray = <any>Array.from(markdown);
    if(markdownArray.length === 0) {
      setTimeout(() => {
        this.setMenu()
      })
      return;
    }
    let menuList = [];
    let menuTree = [];
    const menuName = ['H3', 'H4', 'H5', 'H6']
    let preEle = <any>null;
    function findPosition (itemNow, preEleSelf) {
      const stageNow = Number(itemNow.nodeName.replace('H', '')) // 当前等级3、4、5、6
      const stagePre = Number(preEleSelf.nodeName.replace('H', ''))  // 上一个节点的等级
      if(stageNow > stagePre) { // 比上一个节点等级低
        if(preEleSelf.children) {
          itemNow.parent = preEleSelf
          preEleSelf.children.push(itemNow)
          return preEleSelf.children[preEleSelf.children.length - 1]
        } else {
          preEleSelf.children = []
          itemNow.parent = preEleSelf
          preEleSelf.children.push(itemNow)
          return preEleSelf.children[preEleSelf.children.length - 1]
        }
      } else if(stageNow === stagePre) { // 跟上一个节点等级相等
        if(preEleSelf.parent) {
          itemNow.parent = preEleSelf.parent
          itemNow.parent.children.push(itemNow)
          return itemNow.parent.children[itemNow.parent.children.length - 1]
        } else {
          menuTree.push(itemNow)
          return menuTree[menuTree.length - 1]
        }
      } else if (stageNow < stagePre) {// 比上一个节点等级高，直接塞根目录里？todo
        if(preEleSelf.parent) {
          return findPosition(itemNow, preEleSelf.parent)
        } else {
          menuList.push(itemNow)
          return menuList[menuList.length - 1]
        }
      }
    }
    function fixLeaf(list) {
      list.forEach(item => {
        if(item.children) {
          fixLeaf(item.children)
        } else {
          item.isLeaf = true
        }
      })
    }
    markdownArray.forEach((element, index) => {
      if(menuName.indexOf(element.nodeName) > -1) {
        let itemNow = {
          title: element.innerText,
          nodeName: element.nodeName,
          key: element.nodeName + '-' + index,
          id: element.nodeName + '-' + index,
          index: index,
          parent: null
        }
        if(preEle) {
          preEle = findPosition(itemNow, preEle)
        } else {
          menuTree.push(itemNow)
          preEle = menuTree[menuTree.length - 1]
        }
      }
      if(menuName.indexOf(element.nodeName) > -1) {
        element.id = element.nodeName + '-' + index
        menuList.push({label: element.innerText, id: element.nodeName + '-' + index, nodeName: element.nodeName, top: element.getBoundingClientRect().top})
      }
    })
    fixLeaf(menuTree);
    this.menuTree = menuTree;
    this.menuList = menuList;
    this.showImg();
    document.getElementsByClassName('alain-default__content')[0].addEventListener('scroll', () => {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => this.setActive(), 200)
    });
  }
  scrollTo(id, index) {
    document.getElementsByClassName('alain-default__content')[0].scrollTo({
      top: document.getElementById(id).getBoundingClientRect().top + document.getElementsByClassName('alain-default__content')[0].scrollTop - this.offset,
      behavior: 'smooth'
    });
    document.getElementById(id).style.color = '#1890ff'
    setTimeout(() => {
      document.getElementById(id).style.color = 'unset'
    }, 1500)
  }
  windowScrolling() {
    for(let i=0;i<this.menuList.length;i++) {
      if((document.getElementsByClassName('alain-default__content')[0].scrollTop - this.offset) >= this.menuList[i-1 < 0 ? 0 : i-1].top &&  (document.getElementsByClassName('alain-default__content')[0].scrollTop - this.offset) <= this.menuList[i+1].top) {
        this.activeIndex = i;
        document.getElementById('menu-'+this.menuList[i-1 < 0 ? 0 : i-1].id).scrollIntoView();
        return;
      }
    }
  }
  setActive() {
    let tops = {}
    this.menuList.forEach((item, index) => {
      const dom = document.getElementById(item.id)
      if (dom) {
        let offsetTop = dom.getBoundingClientRect().top - this.offset
        tops[Math.abs(offsetTop)] = index
      }
    })
    let topList = Object.keys(tops).sort((a, b) => Number(a) - Number(b))
    this.activeIndex = tops[topList[0]]
    this.expandedKeys = [...Array.from(new Set(this.expandedKeys)), this.menuList[this.activeIndex - 1 < 0 ?  0 : this.activeIndex - 1].id];
    const menuDom = <any>document.getElementById('menu-'+this.menuList[this.activeIndex - 1 < 0 ?  0 : this.activeIndex - 1].id)
    const menuAcDom = document.getElementById('menu-'+this.menuList[this.activeIndex].id)
    if(this.activeDom) this.activeDom.style.color = 'unset';
    if(menuDom) menuDom.scrollIntoViewIfNeeded();
    if(menuAcDom) {
      menuAcDom.style.color = '#1890ff';
      this.activeDom = menuAcDom;
    }
    // this.cd.markForCheck();
  }
  showImg() {
    const userListDom :any = document.querySelector('.markdown')
         userListDom.onclick = (e)=>{
        // e.srcElement    子元素
          if(e.target.tagName === 'IMG'){
            const images = [
              {
                src: `${e.target.src}`,
                width: `${e.target.offsetWidth}`,
                height: `${e.target.offsetHeight}`,
                alt: '图片'
              },
            ];
            this.nzImageService.preview(images, { nzZoom: 1.5, nzRotate: 0 });
          }
      }
  }
}
