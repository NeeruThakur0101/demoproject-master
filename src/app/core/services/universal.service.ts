import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class UniversalService {
    public gridLayout: BehaviorSubject<object> = new BehaviorSubject<object>({});
    public deviceInfo: BehaviorSubject<object> = new BehaviorSubject<object>({});

    constructor() { }
    public deviceResolution() {
        if (window.innerWidth <= 680) {
            return {
                screen: 'mobile',
                pageSize: 1,
                pageObj: {
                    buttonCount: 1,
                    info: true,
                    type: 'numeric',
                    pageSizes: true,
                    previousNext: true,
                },
            };
        } else if (window.innerWidth > 680 && window.innerWidth <= 900) {
            return {
                screen: 'tab',
                pageSize: 2,
                pageObj: {
                    buttonCount: 2,
                    info: true,
                    type: 'numeric',
                    pageSizes: true,
                    previousNext: true,
                },
            };
        } else if (window.innerWidth > 900) {
            return {
                screen: 'desktop',
                pageSize: 10,
                pageObj: {
                    buttonCount: 10,
                    info: true,
                    type: 'numeric',
                    pageSizes: true,
                    previousNext: true,
                },
            };
        }
    }

    // calculate offset height and return class

    calculateHeight(childBlock, parentBlock, attr1, attr2) {
        if (window.innerHeight > 600 && window.innerHeight <= 755) {
            if (childBlock && parentBlock && parentBlock.nativeElement.attributes[attr1] && childBlock.nativeElement.offsetHeight > parentBlock.nativeElement.attributes[attr1].value) {
                return 'has-scroll';
            } else {
                return 'none';
            }
        } else if (window.innerHeight > 755) {
            if (childBlock && parentBlock && parentBlock.nativeElement.attributes[attr2] && childBlock.nativeElement.offsetHeight > parentBlock.nativeElement.attributes[attr2].value) {
                return 'has-scroll-mac';
            } else {
                return 'none';
            }
        } else {
            return 'none';
        }
    }

    public heightCalculate(commentArea, commentBlock, renderer) {
        if (document.body) {
            renderer.removeClass(commentBlock.nativeElement, 'has-scroll');
            renderer.removeClass(commentBlock.nativeElement, 'none');

            if (commentBlock && commentArea) {
                let className = this.calculateHeight(commentArea, commentBlock, 'max-height', 'min-Height');
                renderer.addClass(commentBlock.nativeElement, className);
            }
        }
    }

    public loadHeight(commentArea, commentBlock, renderer, time?) {
        const delay = time ? time : 100;
        setTimeout(() => {
            this.heightCalculate(commentArea, commentBlock, renderer);
        }, delay);
    }

    // To remove title for dialog close icon
    public removeTooltip(anchorTags) {
        for (var i = 0; i < anchorTags.length; i++) {
            anchorTags[i].removeAttribute("title");
        }
    }
}
