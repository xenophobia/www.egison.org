  /**
   * Returns the values from the source observable sequence only after the other observable sequence produces a value.
   * @param {Observable | Promise} other The observable sequence or Promise that triggers propagation of elements of the source sequence.
   * @returns {Observable} An observable sequence containing the elements of the source sequence starting from the point the other sequence triggered propagation.    
   */
  observableProto.skipUntil = function (other) {
    var source = this;
    return new AnonymousObservable(function (observer) {
      var isOpen = false;
      var disposables = new CompositeDisposable(source.subscribe(function (left) {
        isOpen && observer.onNext(left);
      }, observer.onError.bind(observer), function () {
        isOpen && observer.onCompleted();
      }));

      isPromise(other) && (other = observableFromPromise(other));

      var rightSubscription = new SingleAssignmentDisposable();
      disposables.add(rightSubscription);
      rightSubscription.setDisposable(other.subscribe(function () {
        isOpen = true;
        rightSubscription.dispose();
      }, observer.onError.bind(observer), function () {
        rightSubscription.dispose();
      }));

      return disposables;
    });
  };
